// src/lib/crypto/Ripemd160.mo
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";

module {
  // -------- helpers bitwise --------
  func not32(x : Nat32) : Nat32 { x ^ 0xffffffff };
  func rol(x : Nat32, n : Nat32) : Nat32 { (x << n) | (x >> (32 - n)) };

  // f1..f5 do RIPEMD-160 (com not32)
  func f1(x:Nat32,y:Nat32,z:Nat32):Nat32 { x ^ y ^ z };
  func f2(x:Nat32,y:Nat32,z:Nat32):Nat32 { (x & y) | (not32(x) & z) };
  func f3(x:Nat32,y:Nat32,z:Nat32):Nat32 { (x | not32(y)) ^ z };
  func f4(x:Nat32,y:Nat32,z:Nat32):Nat32 { (x & z) | (y & not32(z)) };
  func f5(x:Nat32,y:Nat32,z:Nat32):Nat32 { x ^ (y | not32(z)) };

  let r1 : [Nat8] = [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
    7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,
    3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,
    1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,
    4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13
  ];

  let r2 : [Nat8] = [
    5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,
    6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,
    15,5,1,3,7,14,6,9,11,8,12,2,10,0,13,4,
    8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,
    12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11
  ];

  let s1 : [Nat8] = [
    11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,
    7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,
    11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,
    11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,
    9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6
  ];

  let s2 : [Nat8] = [
    8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,
    9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,
    9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,
    15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,
    8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11
  ];

  // monta Nat32 de 4 bytes little-endian
  func u32(b0:Nat8,b1:Nat8,b2:Nat8,b3:Nat8) : Nat32 {
    Nat32.fromNat(Nat8.toNat(b0)) |
    (Nat32.fromNat(Nat8.toNat(b1)) << 8) |
    (Nat32.fromNat(Nat8.toNat(b2)) << 16) |
    (Nat32.fromNat(Nat8.toNat(b3)) << 24)
  };

  // Nat32 -> [Nat8] (little-endian)
// helpers para máscara/byte
  let FF32 : Nat32 = 0xff; 
  func byte0(x : Nat32) : Nat8 { Nat8.fromNat(Nat32.toNat(x & FF32)) };
  func byte1(x : Nat32) : Nat8 { Nat8.fromNat(Nat32.toNat((x >> 8)  & FF32)) };
  func byte2(x : Nat32) : Nat8 { Nat8.fromNat(Nat32.toNat((x >> 16) & FF32)) };
  func byte3(x : Nat32) : Nat8 { Nat8.fromNat(Nat32.toNat((x >> 24) & FF32)) };

  // Nat32 -> [Nat8] (little-endian)
  func toLE(x:Nat32) : [Nat8] {
    [ byte0(x), byte1(x), byte2(x), byte3(x) ]
  };

  // concatena arrays de Nat8
  func cat(a : [Nat8], b : [Nat8]) : [Nat8] { Array.append<Nat8>(a, b) };

  public func ripemd160(data : Blob) : Blob {
    // ---- padding (comprimento em bits, LE 64-bit; aqui usamos os 32 bits baixos) ----
    var msg : [Nat8] = Blob.toArray(data);
    let bitLen : Nat = msg.size() * 8;

    msg := Array.append<Nat8>(msg, [0x80]);

    // preenche até ≡ 56 mod 64
    while ((msg.size() % 64) != 56) {
      msg := Array.append<Nat8>(msg, [0x00]);
    };

    // comprimento (64-bit LE) — alto = 0   (fazendo os shifts em Nat32)
  let bl32 : Nat32 = Nat32.fromNat(bitLen);
  let lenLeLow  : [Nat8] = [ byte0(bl32), byte1(bl32), byte2(bl32), byte3(bl32) ];
  let lenLeHigh : [Nat8] = [0,0,0,0];
  msg := Array.append<Nat8>(msg, Array.append<Nat8>(lenLeLow, lenLeHigh));


    // ---- estado inicial ----
    var h0:Nat32 = 0x67452301;
    var h1:Nat32 = 0xefcdab89;
    var h2:Nat32 = 0x98badcfe;
    var h3:Nat32 = 0x10325476;
    var h4:Nat32 = 0xc3d2e1f0;

    var off = 0;
    while (off < msg.size()) {
      // bloco de 16 words (LE)
      let X : [Nat32] = Array.tabulate<Nat32>(16, func(i : Nat) : Nat32 {
        let j = off + i*4;
        u32(msg[j], msg[j+1], msg[j+2], msg[j+3])
      });

      // cópias esquerda/direita
      var al=h0; var bl=h1; var cl=h2; var dl=h3; var el=h4;
      var ar=h0; var br=h1; var cr=h2; var dr=h3; var er=h4;

      var i : Nat = 0;
      while (i < 80) {
        // rodada esquerda
        let (f, k) : (Nat32, Nat32) =
          if (i < 16) (f1(bl,cl,dl), 0x00000000)
          else if (i < 32) (f2(bl,cl,dl), 0x5a827999)
          else if (i < 48) (f3(bl,cl,dl), 0x6ed9eba1)
          else if (i < 64) (f4(bl,cl,dl), 0x8f1bbcdc)
          else (f5(bl,cl,dl), 0xa953fd4e);

        let idxL = Nat8.toNat(r1[i]);
        let sL   = Nat32.fromNat(Nat8.toNat(s1[i]));
        let t    = rol(al + f + X[idxL] + k, sL) + el;
        al := el; el := dl; dl := rol(cl, 10); cl := bl; bl := t;

        // rodada direita
        let (fr, kr) : (Nat32, Nat32) =
          if (i < 16) (f5(br,cr,dr), 0x50a28be6)
          else if (i < 32) (f4(br,cr,dr), 0x5c4dd124)
          else if (i < 48) (f3(br,cr,dr), 0x6d703ef3)
          else if (i < 64) (f2(br,cr,dr), 0x7a6d76e9)
          else (f1(br,cr,dr), 0x00000000);

        let idxR = Nat8.toNat(r2[i]);
        let sR   = Nat32.fromNat(Nat8.toNat(s2[i]));
        let tr   = rol(ar + fr + X[idxR] + kr, sR) + er;
        ar := er; er := dr; dr := rol(cr, 10); cr := br; br := tr;

        i += 1;
      };

      let t0 = h1 + cl + dr;
      h1 := h2 + dl + er;
      h2 := h3 + el + ar;
      h3 := h4 + al + br;
      h4 := h0 + bl + cr;
      h0 := t0;

      off += 64;
    };

    // digest 160 bits = h0||h1||h2||h3||h4 (little-endian)
    let out01 = cat(toLE(h0), toLE(h1));
    let out23 = cat(toLE(h2), toLE(h3));
    let out   = cat(cat(out01, out23), toLE(h4));
    Blob.fromArray(out)
  };
}
