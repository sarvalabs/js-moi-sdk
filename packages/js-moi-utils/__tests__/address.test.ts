import { isValidAddress } from '../src.ts/address';

describe('isValidAddress', () => {
  it('should return true for a valid address', () => {
    const validAddress = '0xd210e094cd2432ef7d488d4310759b6bd81a0cda35a5fcce3dab87c0a841bdba';
    expect(isValidAddress(validAddress)).toBe(true);
  });

  it('should return false for an empty address', () => {
    const emptyAddress = '';
    expect(isValidAddress(emptyAddress)).toBe(false);
  });

  it('should return false for an address with invalid characters', () => {
    const invalidCharactersAddress = '0x1234567890Q23456789012345678901234567890123456789012345678901234';
    expect(isValidAddress(invalidCharactersAddress)).toBe(false);
  });

  it('should return false for an address with incorrect length', () => {
    const incorrectLengthAddress = '0xd210e094cd2432ef7d488d4310759b6bd81a0cda35a5fcce3dab87c0a841bd';
    expect(isValidAddress(incorrectLengthAddress)).toBe(false);
  });
});
