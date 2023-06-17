const ZERO = new Uint8Array([0]);

export const toDER = (x: Uint8Array): Uint8Array => {
  let i = 0;
  while (x[i] === 0) ++i;
  if (i === x.length) return ZERO;
  x = x.slice(i);
  if (x[0] & 0x80) {
    const result = new Uint8Array(1 + x.length);
    result.set(ZERO, 0);
    result.set(x, 1);
    return result;
  }
  return x;
}

// Reference https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
// Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
export const bip66Encode = (r: Uint8Array, s: Uint8Array) => {
  var lenR = r.length;
  var lenS = s.length;
  if (lenR === 0) throw new Error('R length is zero');
  if (lenS === 0) throw new Error('S length is zero');
  if (lenR > 33) throw new Error('R length is too long');
  if (lenS > 33) throw new Error('S length is too long');
  if (r[0] & 0x80) throw new Error('R value is negative');
  if (s[0] & 0x80) throw new Error('S value is negative');
  if (lenR > 1 && (r[0] === 0x00) && !(r[1] & 0x80)) throw new Error('R value excessively padded');
  if (lenS > 1 && (s[0] === 0x00) && !(s[1] & 0x80)) throw new Error('S value excessively padded');

  var signature = new Uint8Array(6 + lenR + lenS);

  signature[0] = 0x30;
  signature[1] = signature.length - 2;
  signature[2] = 0x02;
  signature[3] = lenR;
  signature.set(r, 4);
  signature[4 + lenR] = 0x02;
  signature[5 + lenR] = lenS;
  signature.set(s, 6 + lenR);

  return signature;
}
