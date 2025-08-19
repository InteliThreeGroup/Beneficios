import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

// Corrigido: Aponta para a biblioteca na pasta lib/
import Mgmt "mo:lib/bitcoin/Management";
import Tx "mo:lib/bitcoin/TxBuilder";
import Hash "mo:lib/crypto/Hash";


actor class BtcPayments() {
  // Canister de gerenciamento da IC
  let ic : Mgmt.IC = actor("aaaaa-aa");

  // Chave tECDSA (no testnet, "test_key_1" é a chave de teste padrão)
  let keyId : Mgmt.EcdsaKeyId = { curve = #secp256k1; name = "test_key_1" };

  // Rede Bitcoin alvo (mude para #mainnet em produção)
  let net : Mgmt.BitcoinNetwork = #testnet;

  // === Funções Utilitárias ===
  private func hex(bytes : [Nat8]) : Text {
    let hexchars = "0123456789abcdef";
    var out = "";
    for (b in bytes.vals()) {
      let hi = (b >> 4) & 0xf;
      let lo = b & 0xf;
      out #= hexchars.substr(hi, 1) # hexchars.substr(lo, 1);
    };
    out
  };

  private func reverseBytes(b : Blob) : Blob {
    let a = Blob.toArray(b);
    var r : [Nat8] = [];
    var i = a.size();
    while (i > 0) {
      i -= 1;
      r := r # [a[i]];
    };
    Blob.fromArray(r)
  };

  // === Lógica de Derivação de Chave ===
  // Gera um caminho de derivação único para cada carteira.
  // Isso é crucial para a segurança e para separar os fundos.
  private func derivation(companyId : Nat, benefitId : Nat, user : Principal) : [Blob] {
    [
      Blob.fromArray(Text.encodeUtf8("beneficios-app")), // Um sal global para o app
      Blob.fromArray(Text.encodeUtf8("company")),
      Blob.fromArray(Text.encodeUtf8(Nat.toText(companyId))),
      Blob.fromArray(Text.encodeUtf8("benefit")),
      Blob.fromArray(Text.encodeUtf8(Nat.toText(benefitId))),
      Blob.fromArray(Text.encodeUtf8("user")),
      user.toBlob() // Usar o blob do principal é mais robusto
    ]
  };

  /// Retorna o hash160 (20 bytes) da chave pública do chamador.
  /// O frontend usa isso para gerar um endereço Bitcoin P2WPKH (bech32).
  public shared ({ caller }) func get_own_pubkey_hash160(companyId : Nat, benefitId : Nat) : async Blob {
    let path = derivation(companyId, benefitId, caller);
    let pub_res = await ic.ecdsa_public_key({
      canister_id = null;
      derivation_path = path;
      key_id = keyId;
    });
    Hash.hash160(pub_res.public_key)
  };

  /// Retorna o saldo confirmado de um endereço (em satoshis).
  public query func get_balance(address : Text, min_confirmations : Nat32) : async Nat64 {
    await ic.bitcoin_get_balance({
      address;
      network = net;
      min_confirmations = ?min_confirmations;
    })
  };

  /// Envia BTC de uma carteira derivada para um endereço de destino.
  /// - `companyId`, `benefitId`: Identificam a carteira de origem (junto com o `caller`).
  /// - `from_address`: O endereço bech32 da carteira de origem (gerado no frontend).
  /// - `program_dest_20b`: O hash160 da chave pública do destinatário (20 bytes).
  /// - `amount_sats`: Quantia a ser enviada ao destinatário.
  /// - `fee_rate_sats_vb`: Taxa de mineração em satoshis por vbyte.
  public shared ({ caller }) func send_btc(
    companyId : Nat,
    benefitId : Nat,
    from_address : Text,
    program_dest_20b : Blob,
    amount_sats : Nat64,
    fee_rate_sats_vb : Nat64
  ) : async Text {
    // Validação da entrada
    if (Blob.size(program_dest_20b) != 20) {
      Debug.trap("program_dest_20b must be 20 bytes");
    };

    // 1. Obter chave pública e hash160 da carteira de origem
    let path = derivation(companyId, benefitId, caller);
    let pub_res = await ic.ecdsa_public_key({ canister_id = null; derivation_path = path; key_id = keyId });
    let from_pubkey = pub_res.public_key;
    let from_h160 = Hash.hash160(from_pubkey);

    // 2. Obter UTXOs (saídas de transação não gastas) do endereço de origem
    let utxos_res = await ic.bitcoin_get_utxos({
      address = from_address;
      network = net;
      filter = ?{ #min_confirmations = 1 }; // Apenas UTXOs confirmados
    });
    if (utxos_res.utxos.size() == 0) {
      Debug.trap("No confirmed UTXOs found");
    };

    // 3. Estratégia de seleção de UTXO (ingênua: usar a maior)
    let biggest_utxo = Array.foldLeft<Mgmt.UTXO, Mgmt.UTXO>(
      utxos_res.utxos,
      utxos_res.utxos[0],
      func (acc, u) { if (u.value > acc.value) u else acc }
    );

    // 4. Calcular taxa e valor do troco
    let est_vbytes : Nat64 = 110; // Estimativa para transação P2WPKH com 1 entrada e 2 saídas
    let fee = fee_rate_sats_vb * est_vbytes;

    if (biggest_utxo.value <= amount_sats + fee) {
      Debug.trap("Insufficient funds to cover amount and fee");
    };
    let change_value : Nat64 = biggest_utxo.value - amount_sats - fee;

    // 5. Construir os scripts de saída (destino e troco)
    let to_script = Tx.scriptPubKeyP2WPKH(program_dest_20b);
    let change_script = Tx.scriptPubKeyP2WPKH(from_h160); // O troco volta para nós mesmos

    // 6. Montar os outputs da transação
    let outputsRaw = Tx.buildOutputs2(
      to_script, amount_sats,
      change_script, change_value
    );

    // 7. Preparar dados da entrada para assinatura (BIP-143)
    let input : Tx.Input = {
      txid = biggest_utxo.outpoint.txid;
      vout = biggest_utxo.outpoint.vout;
      value = biggest_utxo.value;
      pubKeyHash160 = from_h160;
    };
    let scriptCode = Tx.scriptCodeP2WPKH(from_h160);
    let preimage = Tx.bip143Preimage1in(2, input, scriptCode, 0xffffffff, outputsRaw, 0, 0x01); // SIGHASH_ALL
    let digest32 = Hash.sha256d(preimage);

    // 8. Assinar o hash da transação com tECDSA
    let sig_res = await ic.sign_with_ecdsa({
      message_hash = digest32;
      derivation_path = path;
      key_id = keyId;
    });
    // Adicionar o tipo de sighash (SIGHASH_ALL) ao final da assinatura
    let der_sig_plus_hashtype = Blob.fromArray(Blob.toArray(sig_res.signature) # [0x01]);

    // 9. Montar a transação final serializada
    let raw_tx = Tx.assembleTx1in2out(
      2, input, 0xffffffff, outputsRaw, 0, der_sig_plus_hashtype, from_pubkey
    );

    // 10. Enviar a transação para a rede Bitcoin
    await ic.bitcoin_send_transaction({ network = net; transaction = raw_tx });

    // 11. Calcular o TXID e retorná-lo
    // O TXID é o hash duplo da transação serializada, mas em little-endian.
    let txid_blob = reverseBytes(Hash.sha256d(raw_tx));
    hex(Blob.toArray(txid_blob))
  };
}