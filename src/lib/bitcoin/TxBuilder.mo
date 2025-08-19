// src/lib/bitcoin/TxBuilder.mo
import Blob  "mo:base/Blob";
import Nat   "mo:base/Nat";
import Nat8  "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Iter  "mo:base/Iter";
import Debug "mo:base/Debug";

import Hash  "../../lib/crypto/Hash";

module {
  public type Input  = { txid : Blob; vout : Nat32; value : Nat64; pubKeyHash160 : Blob };
  public type Output = { value : Nat64; scriptPubKey : Blob };

  // ---------- helpers ----------
  func cat(a : [Nat8], b : [Nat8]) : [Nat8] { Array.append<Nat8>(a, b) };
  func catMany(chunks : [[Nat8]]) : [Nat8] {
    Array.foldLeft<[Nat8], [Nat8]>(chunks, [], func(acc, c) { Array.append<Nat8>(acc, c) })
  };

  // varint (apenas até 0xffff aqui; expanda se precisar)
  public func varint(n : Nat) : [Nat8] {
    if (n < 0xfd) { return [Nat8.fromNat(n)] };
    if (n <= 0xffff) {
      let lo = Nat8.fromNat(n % 256);
      let hi = Nat8.fromNat((n / 256) % 256);
      return [0xfd, lo, hi];
    };
    Debug.trap("varint for n > 0xffff not implemented")
  };

  // LE de 32 bits via divisão/módulo (evita bitwise em Nat32)
  public func u32le(n : Nat32) : [Nat8] {
    let x : Nat = Nat32.toNat(n);
    [
      Nat8.fromNat(x % 256),
      Nat8.fromNat((x / 256) % 256),
      Nat8.fromNat((x / 65536) % 256),
      Nat8.fromNat((x / 16777216) % 256)
    ]
  };

  // LE de 64 bits via divisão/módulo
  public func u64le(n : Nat64) : [Nat8] {
    var out : [Nat8] = [];
    var x = n;
    // 8 bytes
    for (_ in Iter.range(0,7)) {
      out := Array.append<Nat8>(out, [Nat8.fromNat(Nat64.toNat(x % 256))]);
      x := x / 256;
    };
    out
  };

  public func varbytes(b : Blob) : [Nat8] {
    let arr = Blob.toArray(b);
    cat(varint(arr.size()), arr)
  };

  // ---------- scripts ----------
  // ScriptPubKey P2WPKH: 0x00 0x14 <20-byte>
  public func scriptPubKeyP2WPKH(h160 : Blob) : Blob {
    if (Blob.toArray(h160).size() != 20) { Debug.trap("h160 must be 20 bytes") };
    Blob.fromArray(cat([0x00, 0x14], Blob.toArray(h160)))
  };

  // ScriptCode P2WPKH para BIP-143: OP_DUP OP_HASH160 <20> OP_EQUALVERIFY OP_CHECKSIG
  public func scriptCodeP2WPKH(h160 : Blob) : Blob {
    Blob.fromArray(catMany([
      [0x76, 0xa9, 0x14],
      Blob.toArray(h160),
      [0x88, 0xac]
    ]))
  };

  // ---------- outputs ----------
  // outputsRaw (2 outputs)
  public func buildOutputs2(destScript : Blob, destValue : Nat64, changeScript : Blob, changeValue : Nat64) : Blob {
    let count = [2 : Nat8]; // varint(2)
    let out1 = cat(u64le(destValue), varbytes(destScript));
    let out2 = cat(u64le(changeValue), varbytes(changeScript));
    Blob.fromArray(catMany([count, out1, out2]))
  };

  // ---------- preimage BIP-143 ----------
  public func bip143Preimage1in(
    version : Nat32, input : Input, scriptCode : Blob, sequence : Nat32,
    outputsRaw : Blob, locktime : Nat32, sighash_type : Nat32
  ) : Blob {
    // Para SIGHASH_ALL (1 input), hashPrevouts/hashSequence são sobre todos os inputs/sequences.
    // Aqui, com 1 input, prevout = txid||vout do único input.
    let prevout = Blob.fromArray(cat(Blob.toArray(input.txid), u32le(input.vout)));
    let hashPrevouts = Hash.sha256d(prevout);
    let hashSequence = Hash.sha256d(Blob.fromArray(u32le(sequence)));
    let hashOutputs  = Hash.sha256d(outputsRaw);

    Blob.fromArray(catMany([
      u32le(version),
      Blob.toArray(hashPrevouts),
      Blob.toArray(hashSequence),
      // outpoint atual
      Blob.toArray(input.txid), u32le(input.vout),
      // scriptCode do input
      varbytes(scriptCode),
      // valor do UTXO sendo gasto
      u64le(input.value),
      // sequence do input
      u32le(sequence),
      // hash dos outputs
      Blob.toArray(hashOutputs),
      // locktime e tipo de sighash
      u32le(locktime),
      u32le(sighash_type)
    ]))
  };

  // ---------- montagem final (SegWit, 1-in/2-out) ----------
  public func assembleTx1in2out(
    version : Nat32, input : Input, sequence : Nat32,
    outputsRaw : Blob, locktime : Nat32,
    derSigPlusHashType : Blob, pubkeyCompressed : Blob
  ) : Blob {
    let marker  : [Nat8] = [0x00];
    let flag    : [Nat8] = [0x01];
    let inCount : [Nat8] = [0x01]; // varint(1)

    Blob.fromArray(catMany([
      u32le(version),
      marker, flag,
      inCount,
      // input
      Blob.toArray(input.txid), u32le(input.vout),
      [0x00], // scriptSig vazio
      u32le(sequence),
      // outputs (já com a contagem dentro de outputsRaw)
      Blob.toArray(outputsRaw),
      // witness (2 itens: assinatura + pubkey)
      [0x02],
      varbytes(derSigPlusHashType),
      varbytes(pubkeyCompressed),
      // locktime
      u32le(locktime)
    ]))
  };
}