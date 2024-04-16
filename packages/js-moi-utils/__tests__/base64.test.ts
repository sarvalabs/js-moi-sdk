import { decodeBase64, encodeBase64 } from '../src.ts/base64';

describe('Base64 Encoding and Decoding', () => {
  const testData = [72, 101, 108, 108, 111]; // [72, 101, 108, 108, 111] represents the ASCII values for 'Hello'

  it('should correctly encode a Uint8Array into a base64 string', () => {
    const uint8Array = new Uint8Array(testData);
    const expectedBase64 = 'SGVsbG8=';
    const encoded = encodeBase64(uint8Array);
    expect(encoded).toBe(expectedBase64);
  });

  it('should correctly decode a base64 string into a Uint8Array', () => {
    const base64String = 'SGVsbG8=';
    const expectedUint8Array = new Uint8Array(testData);
    const decoded = decodeBase64(base64String);
    expect(decoded).toEqual(expectedUint8Array);
  });
});
