import Blob "mo:base/Blob";
import Sha256 "mo:lib/crypto/Sha256";
import Ripemd "mo:lib/crypto/Ripemd160";

module Hash {
  public func sha256(b : Blob) : Blob { Sha256.hash(b) };
  public func sha256d(b : Blob) : Blob { Sha256.hash2(b) };
  public func hash160(b : Blob) : Blob { Ripemd.ripemd160(Sha256.hash(b)) };
}