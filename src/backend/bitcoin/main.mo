// CÓDIGO FINAL E RECOMENDADO PARA: src/backend/bitcoin/main.mo

import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Char "mo:base/Char";
// A linha abaixo não é mais necessária!
// import ExperimentalCycles "mo:base/ExperimentalCycles";

import Mgmt "../../lib/bitcoin/Management";
import Tx   "../../lib/bitcoin/TxBuilder";
import Hash "../../lib/crypto/Hash";

persistent actor class BtcPayments() = this{
  transient let ic   : Mgmt.IC            = Mgmt.ic;
  transient let keyId: Mgmt.EcdsaKeyId    = { curve = #secp256k1; name = "test_key_1" };
  transient let net  : Mgmt.BitcoinNetwork = #regtest;

  // === Funções Utilitárias ===
  private func nibbleChar(n : Nat8) : Char {
    if (Nat8.toNat(n) < 10)
      Char.fromNat32(48 + Nat32.fromNat(Nat8.toNat(n)))
    else
      Char.fromNat32(87 + Nat32.fromNat(Nat8.toNat(n)))
  };

  private func hex(bytes : [Nat8]) : Text {
    var chars : [Char] = [];
    for (b in bytes.vals()) {
      let hi : Nat8 = (b >> 4) & (0x0f : Nat8);
      let lo : Nat8 = b & (0x0f : Nat8);
      chars := Array.append<Char>(chars, [nibbleChar(hi), nibbleChar(lo)]);
    };
    Text.fromIter(chars.vals())
  };

  private func reverseBytes(b : Blob) : Blob {
    let a = Blob.toArray(b);
    var r : [Nat8] = [];
    var i = a.size();
    while (i > 0) {
      i -= 1;
      r := Array.append<Nat8>(r, [a[i]]);
    };
    Blob.fromArray(r)
  };

  // === Lógica de Derivação de Chave ===
  private func derivation(companyId : Nat, benefitId : Nat, user : Principal) : [Blob] {
    func b(t : Text) : Blob { Text.encodeUtf8(t) };

    let p0 : Blob = b("beneficios-app");
    let p1 : Blob = b("company");
    let p2 : Blob = b(Nat.toText(companyId));
    let p3 : Blob = b("benefit");
    let p4 : Blob = b(Nat.toText(benefitId));
    let p5 : Blob = b("user");
    let p6 : Blob = b(Principal.toText(user));

    let path : [Blob] = [p0, p1, p2, p3, p4, p5, p6];
    path
  };

  /// Retorna o hash160 (20 bytes) da chave pública do chamador.
  public shared ({ caller }) func get_own_pubkey_hash160(companyId : Nat, benefitId : Nat) : async Blob {
    let path = derivation(companyId, benefitId, caller);

    let pub_res = await (with cycles = 10_000_000_000) ic.ecdsa_public_key({
      canister_id = null;
      derivation_path = path;
      key_id = keyId;
    });

    Hash.hash160(pub_res.public_key)
  };

  /// Retorna o saldo confirmado de um endereço (em satoshis).
  public shared func get_balance(address : Text, min_confirmations : Nat32) : async Nat64 {
    return await (with cycles = 100_000_000) ic.bitcoin_get_balance({
      address;
      network = net;
      min_confirmations = ?min_confirmations;
    });
  };

  /// Envia BTC de uma carteira derivada para um endereço de destino.
  public shared ({ caller }) func send_btc(
    companyId : Nat,
    benefitId : Nat,
    from_address : Text,
    program_dest_20b : Blob,
    amount_sats : Nat64,
    fee_rate_sats_vb : Nat64
  ) : async Text {
    if (Blob.toArray(program_dest_20b).size() != 20) {
      Debug.trap("program_dest_20b must be 20 bytes");
    };

    let path = derivation(companyId, benefitId, caller);

    let pub_res = await (with cycles = 10_000_000_000) ic.ecdsa_public_key({ canister_id = null; derivation_path = path; key_id = keyId });
    let from_pubkey = pub_res.public_key;
    let from_h160 = Hash.hash160(from_pubkey);

    let utxos_res = await (with cycles = 1_000_000_000) ic.bitcoin_get_utxos({
      address = from_address;
      network = net;
      filter = ?{ min_confirmations = 1 };
    });
    if (utxos_res.utxos.size() == 0) {
      Debug.trap("No confirmed UTXOs found");
    };

    let biggest_utxo = Array.foldLeft<Mgmt.UTXO, Mgmt.UTXO>(
      utxos_res.utxos,
      utxos_res.utxos[0],
      func (acc, u) { if (u.value > acc.value) u else acc }
    );

    let est_vbytes : Nat64 = 110;
    let fee = fee_rate_sats_vb * est_vbytes;

    if (biggest_utxo.value <= amount_sats + fee) {
      Debug.trap("Insufficient funds to cover amount and fee");
    };
    let change_value : Nat64 = biggest_utxo.value - amount_sats - fee;

    let to_script = Tx.scriptPubKeyP2WPKH(program_dest_20b);
    let change_script = Tx.scriptPubKeyP2WPKH(from_h160);

    let outputsRaw = Tx.buildOutputs2(
      to_script, amount_sats,
      change_script, change_value
    );

    let input : Tx.Input = {
      txid = biggest_utxo.outpoint.txid;
      vout = biggest_utxo.outpoint.vout;
      value = biggest_utxo.value;
      pubKeyHash160 = from_h160;
    };
    let scriptCode = Tx.scriptCodeP2WPKH(from_h160);
    let preimage = Tx.bip143Preimage1in(2, input, scriptCode, 0xffffffff, outputsRaw, 0, 0x01);
    let digest32 = Hash.sha256d(preimage);

    let sig_res = await (with cycles = 40_000_000_000) ic.sign_with_ecdsa({
      message_hash = digest32;
      derivation_path = path;
      key_id = keyId;
    });

    let der_sig_plus_hashtype = Blob.fromArray(Array.append<Nat8>(Blob.toArray(sig_res.signature), [1 : Nat8]));

    let raw_tx = Tx.assembleTx1in2out(
      2, input, 0xffffffff, outputsRaw, 0, der_sig_plus_hashtype, from_pubkey
    );

    await (with cycles = 2_000_000_000) ic.bitcoin_send_transaction({ network = net; transaction = raw_tx });

    let txid_blob = reverseBytes(Hash.sha256d(raw_tx));
    hex(Blob.toArray(txid_blob))
  };
}