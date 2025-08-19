import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";

module {
  // ---------- util ----------
  func rotr(x : Nat32, n : Nat32) : Nat32 { (x >> n) | (x << (32 - n)) };
  func ch(x : Nat32, y : Nat32, z : Nat32) : Nat32 { (x & y) ^ ((~x) & z) };
  func maj(x : Nat32, y : Nat32, z : Nat32) : Nat32 { (x & y) ^ (x & z) ^ (y & z) };
  func bsig0(x : Nat32) : Nat32 { rotr(x,2) ^ rotr(x,13) ^ rotr(x,22) };
  func bsig1(x : Nat32) : Nat32 { rotr(x,6) ^ rotr(x,11) ^ rotr(x,25) };
  func ssig0(x : Nat32) : Nat32 { rotr(x,7) ^ rotr(x,18) ^ (x >> 3) };
  func ssig1(x : Nat32) : Nat32 { rotr(x,17) ^ rotr(x,19) ^ (x >> 10) };

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

  func u32(b0:Nat8,b1:Nat8,b2:Nat8,b3:Nat8) : Nat32 {
    (Nat32.fromNat(Nat8.toNat(b0)) << 24) |
    (Nat32.fromNat(Nat8.toNat(b1)) << 16) |
    (Nat32.fromNat(Nat8.toNat(b2)) << 8)  |
    (Nat32.fromNat(Nat8.toNat(b3)));
  };

  func toBytes32(x:Nat32) : [Nat8] {
    [ Nat8.fromNat(Nat32.toNat(x >> 24 & 0xff)),
      Nat8.fromNat(Nat32.toNat(x >> 16 & 0xff)),
      Nat8.fromNat(Nat32.toNat(x >> 8  & 0xff)),
      Nat8.fromNat(Nat32.toNat(x & 0xff)) ]
  };

  public func hash(data : Blob) : Blob {
    // padding
    let bytes = Blob.toArray(data);
    let bitLen : Nat = bytes.size() * 8;
    var msg = Array.append<Nat8>(bytes, [0x80]);

    // add zeros until length ≡ 56 mod 64
    while ((msg.size() % 64) != 56) { msg := Array.append(msg, [0x00]) };

    // append 64-bit length big-endian
    var lenBytes : [Nat8] = [];
    var n = bitLen;
    let total : Nat = 64; // 64-bit
    var i = 0;
    let pad = 8;
    let full : [Nat8] = [
      Nat8.fromNat((bitLen >> 56) & 0xff),
      Nat8.fromNat((bitLen >> 48) & 0xff),
      Nat8.fromNat((bitLen >> 40) & 0xff),
      Nat8.fromNat((bitLen >> 32) & 0xff),
      Nat8.fromNat((bitLen >> 24) & 0xff),
      Nat8.fromNat((bitLen >> 16) & 0xff),
      Nat8.fromNat((bitLen >> 8)  & 0xff),
      Nat8.fromNat(bitLen & 0xff)
    ];
    msg := Array.append(msg, full);

    // init
    var H0 : Nat32 = 0x6a09e667;
    var H1 : Nat32 = 0xbb67ae85;
    var H2 : Nat32 = 0x3c6ef372;
    var H3 : Nat32 = 0xa54ff53a;
    var H4 : Nat32 = 0x510e527f;
    var H5 : Nat32 = 0x9b05688c;
    var H6 : Nat32 = 0x1f83d9ab;
    var H7 : Nat32 = 0x5be0cd19;

    // process 512-bit chunks
    var offset = 0;
    while (offset < msg.size()) {
      // message schedule
      var W : [Nat32] = Array.init<Nat32>(64, 0);
      var t = 0;
      // first 16 words
      while (t < 16) {
        let i = offset + t*4;
        W[t] := u32(msg[i], msg[i+1], msg[i+2], msg[i+3]);
        t += 1;
      };
      // extend
      while (t < 64) {
        W[t] := ssig1(W[t-2]) + W[t-7] + ssig0(W[t-15]) + W[t-16];
        t += 1;
      };

      // init working vars
      var a = H0; var b = H1; var c = H2; var d = H3;
      var e = H4; var f = H5; var g = H6; var h = H7;

      // compression
      var i2 = 0;
      while (i2 < 64) {
        let T1 = h + bsig1(e) + ch(e,f,g) + K[i2] + W[i2];
        let T2 = bsig0(a) + maj(a,b,c);
        h = g; g = f; f = e; e = d + T1;
        d = c; c = b; b = a; a = T1 + T2;
        i2 += 1;
      };

      // add to state
      H0 += a; H1 += b; H2 += c; H3 += d;
      H4 += e; H5 += f; H6 += g; H7 += h;

      offset += 64;
    };

    let out = toBytes32(H0) # toBytes32(H1) # toBytes32(H2) # toBytes32(H3) #
              toBytes32(H4) # toBytes32(H5) # toBytes32(H6) # toBytes32(H7);
    Blob.fromArray(out)
  };

  public func hash2(data : Blob) : Blob { hash(hash(data)) };
}
