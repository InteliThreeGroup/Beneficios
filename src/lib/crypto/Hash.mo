// CÓDIGO CORRIGIDO PARA: src/lib/crypto/Hash.mo

import Blob "mo:base/Blob";
import Sha256 "../../lib/crypto/Sha256";
import Ripemd "../../lib/crypto/Ripemd160";

module Hash {
  // A função em Sha256.mo chama-se 'sha256' e espera [Nat8]
  public func sha256(b : Blob) : Blob {
    let bytes = Blob.toArray(b);
    let hash_bytes = Sha256.sha256(bytes);
    return Blob.fromArray(hash_bytes);
  };

  // sha256d é simplesmente sha256 aplicado duas vezes.
  public func sha256d(b : Blob) : Blob {
    let bytes = Blob.toArray(b);
    let hash1_bytes = Sha256.sha256(bytes);
    let hash2_bytes = Sha256.sha256(hash1_bytes);
    return Blob.fromArray(hash2_bytes);
  };

  // hash160 é ripemd160 do resultado de sha256.
  public func hash160(b : Blob) : Blob {
    let bytes = Blob.toArray(b);
    let sha_hash_bytes = Sha256.sha256(bytes);
    // Ripemd.ripemd160 espera um Blob, então precisamos converter de volta
    let sha_hash_blob = Blob.fromArray(sha_hash_bytes);
    return Ripemd.ripemd160(sha_hash_blob);
  };
}