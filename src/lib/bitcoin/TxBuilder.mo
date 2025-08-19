import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Hash "mo:lib/crypto/Hash";

module TxBuilder {
  public type Input = { txid : Blob; vout : Nat32; value : Nat64; pubKeyHash160 : Blob };
  public type Output = { value : Nat64; scriptPubKey : Blob };

  // ScriptPubKey para P2WPKH: 0x00 <20-byte-hash>
  public func scriptPubKeyP2WPKH(h160 : Blob) : Blob {
    if (Blob.size(h160) != 20) { Debug.trap("h160 must be 20 bytes") };
    Blob.fromArray([0x00, 0x14] # Blob.toArray(h160))
  };

  // ScriptCode para P2WPKH (usado na assinatura BIP-143)
  public func scriptCodeP2WPKH(h160 : Blob) : Blob {
    Blob.fromArray([0x76, 0xa9, 0x14] # Blob.toArray(h160) # [0x88, 0xac])
  };

  // Funções para serializar inteiros (little-endian e varint)
  public func varint(n : Nat) : [Nat8] {
    if (n < 0xfd) return [Nat8.fromNat(n)];
    if (n <= 0xffff) return [0xfd, Nat8.fromNat(n & 0xff), Nat8.fromNat((n >> 8) & 0xff)];
    // Adicionar suporte para u32 e u64 se precisar de contagens maiores
    Debug.trap("varint for n > 0xffff not implemented");
  };
  public func u32le(n : Nat32) : [Nat8] {
    [ Nat8.fromNat(n & 0xff),
      Nat8.fromNat((n >> 8) & 0xff),
      Nat8.fromNat((n >> 16) & 0xff),
      Nat8.fromNat((n >> 24) & 0xff) ]
  };
  public func u64le(n : Nat64) : [Nat8] {
    var a : [Nat8] = [];
    var x = n;
    for (_ in Iter.range(0, 7)) {
      a := a # [Nat8.fromNat(x & 0xff)];
      x := x >> 8;
    };
    a
  };
  public func varbytes(b : Blob) : [Nat8] { varint(Blob.size(b)) # Blob.toArray(b) };

  // Constrói a parte dos outputs para 2 saídas (destino + troco)
  public func buildOutputs2(destScript : Blob, destValue : Nat64, changeScript : Blob, changeValue : Nat64) : Blob {
    let count = [0x02]; // varint(2)
    let out1_val = u64le(destValue);
    let out1_script = varbytes(destScript);
    let out2_val = u64le(changeValue);
    let out2_script = varbytes(changeScript);
    Blob.fromArray(count # out1_val # out1_script # out2_val # out2_script)
  };

  // Gera o "preimage" da transação para assinatura (conforme BIP-143 para 1 input)
  public func bip143Preimage1in(
    version : Nat32, input : Input, scriptCode : Blob, sequence : Nat32,
    outputsRaw : Blob, locktime : Nat32, sighash_type : Nat32
  ) : Blob {
    let prevout = Blob.fromArray(Blob.toArray(input.txid) # u32le(input.vout));
    let hashPrevouts = Hash.sha256d(prevout);
    let hashSequence = Hash.sha256d(Blob.fromArray(u32le(sequence)));
    let hashOutputs  = Hash.sha256d(outputsRaw);

    Blob.fromArray(
      u32le(version) #
      Blob.toArray(hashPrevouts) #
      Blob.toArray(hashSequence) #
      Blob.toArray(input.txid) # u32le(input.vout) #
      varbytes(scriptCode) #
      u64le(input.value) #
      u32le(sequence) #
      Blob.toArray(hashOutputs) #
      u32le(locktime) #
      u32le(sighash_type)
    )
  };

  // Monta a transação final serializada (formato SegWit)
  public func assembleTx1in2out(
    version : Nat32, input : Input, sequence : Nat32,
    outputsRaw : Blob, locktime : Nat32,
    derSigPlusHashType : Blob, pubkeyCompressed : Blob
  ) : Blob {
    let marker : [Nat8] = [0x00];
    let flag   : [Nat8] = [0x01];
    let inCount = [0x01]; // varint(1)

    Blob.fromArray(
      u32le(version) #
      marker # flag #
      inCount #
      Blob.toArray(input.txid) # u32le(input.vout) #
      [0x00] # scriptSig vazio (tamanho 0)
      # u32le(sequence) #
      Blob.toArray(outputsRaw) # // já contém a contagem de outputs
      // Witness data
      [0x02]  // 2 itens na witness: assinatura e chave pública
      # varbytes(derSigPlusHashType)
      # varbytes(pubkeyCompressed)
      # u32le(locktime)
    )
  };
}