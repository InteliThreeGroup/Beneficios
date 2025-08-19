import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";

module {
  // ---------- bitwise helpers ----------
  func not32(x : Nat32) : Nat32 { x ^ 0xffffffff };
  func rotr(x : Nat32, n : Nat32) : Nat32 { (x >> n) | (x << (32 - n)) };

  // SHA-256 funcs
  func ch (x : Nat32, y : Nat32, z : Nat32) : Nat32 { (x & y) ^ (not32(x) & z) };
  func maj(x : Nat32, y : Nat32, z : Nat32) : Nat32 { (x & y) ^ (x & z) ^ (y & z) };
  func bsig0(x : Nat32) : Nat32 { rotr(x,2)  ^ rotr(x,13) ^ rotr(x,22) };
  func bsig1(x : Nat32) : Nat32 { rotr(x,6)  ^ rotr(x,11) ^ rotr(x,25) };
  func ssig0(x : Nat32) : Nat32 { rotr(x,7)  ^ rotr(x,18) ^ (x >> 3) };
  func ssig1(x : Nat32) : Nat32 { rotr(x,17) ^ rotr(x,19) ^ (x >> 10) };

  // K constants
  let K : [Nat32] = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];

  // 0xff como Nat32 (evita mistura Nat/Nat32)
  let FF32 : Nat32 = 0xff;

  // monta Nat32 de 4 bytes (big-endian)
  func u32(b0:Nat8,b1:Nat8,b2:Nat8,b3:Nat8) : Nat32 {
    (Nat32.fromNat(Nat8.toNat(b0)) << 24) |
    (Nat32.fromNat(Nat8.toNat(b1)) << 16) |
    (Nat32.fromNat(Nat8.toNat(b2)) << 8)  |
    (Nat32.fromNat(Nat8.toNat(b3)))
  };

  // Nat32 -> [Nat8] big-endian
  func toBytes32BE(x:Nat32) : [Nat8] {
    [
      Nat8.fromNat(Nat32.toNat((x >> 24) & FF32)),
      Nat8.fromNat(Nat32.toNat((x >> 16) & FF32)),
      Nat8.fromNat(Nat32.toNat((x >> 8)  & FF32)),
      Nat8.fromNat(Nat32.toNat(x & FF32))
    ]
  };

  // concat util
  func cat(a : [Nat8], b : [Nat8]) : [Nat8] { Array.append<Nat8>(a, b) };

  public func hash(data : Blob) : Blob {
    // 1) padding: 0x80, zeros até ≡ 56 (mod 64), depois length 64-bit BE
    let bytes : [Nat8] = Blob.toArray(data);
    var msg : [Nat8] = Array.append<Nat8>(bytes, [0x80]);

    while ((msg.size() % 64) != 56) {
      msg := Array.append<Nat8>(msg, [0x00]);
    };

    // comprimento em bits como 64-bit big-endian (hi||lo, cada um Nat32)
    let bitLen : Nat = bytes.size() * 8;
    let TWO32 : Nat = 4294967296; // 2^32
    let hi : Nat32 = Nat32.fromNat(bitLen / TWO32);
    let lo : Nat32 = Nat32.fromNat(bitLen % TWO32);
    let lenBE : [Nat8] = cat(toBytes32BE(hi), toBytes32BE(lo));
    msg := Array.append<Nat8>(msg, lenBE);

    // 2) estado inicial
    var H0 : Nat32 = 0x6a09e667;
    var H1 : Nat32 = 0xbb67ae85;
    var H2 : Nat32 = 0x3c6ef372;
    var H3 : Nat32 = 0xa54ff53a;
    var H4 : Nat32 = 0x510e527f;
    var H5 : Nat32 = 0x9b05688c;
    var H6 : Nat32 = 0x1f83d9ab;
    var H7 : Nat32 = 0x5be0cd19;

    // 3) processar blocos de 512 bits
    var offset = 0;
    while (offset < msg.size()) {
      // schedule
      var W : [var Nat32] = Array.init<Nat32>(64, 0);
      var t = 0;
      // 16 words iniciais (big-endian)
      while (t < 16) {
        let i = offset + t*4;
        W[t] := u32(msg[i], msg[i+1], msg[i+2], msg[i+3]);
        t += 1;
      };
      // expande até 64
      while (t < 64) {
        W[t] := ssig1(W[t-2]) + W[t-7] + ssig0(W[t-15]) + W[t-16];
        t += 1;
      };

      // working vars
      var a = H0; var b = H1; var c = H2; var d = H3;
      var e = H4; var f = H5; var g = H6; var h = H7;

      // compress
      var i2 = 0;
      while (i2 < 64) {
        let T1 = h + bsig1(e) + ch(e,f,g) + K[i2] + W[i2];
        let T2 = bsig0(a) + maj(a,b,c);
        h := g; g := f; f := e; e := d + T1;
        d := c; c := b; b := a; a := T1 + T2;
        i2 += 1;
      };

      // add back
      H0 += a; H1 += b; H2 += c; H3 += d;
      H4 += e; H5 += f; H6 += g; H7 += h;

      offset += 64;
    };

    // 4) saída: 32 bytes (big-endian)
    let out = cat(
      cat(cat(toBytes32BE(H0), toBytes32BE(H1)), cat(toBytes32BE(H2), toBytes32BE(H3))),
      cat(cat(toBytes32BE(H4), toBytes32BE(H5)), cat(toBytes32BE(H6), toBytes32BE(H7)))
    );
    Blob.fromArray(out)
  };

  public func hash2(data : Blob) : Blob { hash(hash(data)) };
}
