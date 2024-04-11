import {
  entropyToMnemonic,
  generateMnemonic,
  getDefaultWordlist,
  mnemonicToEntropy,
  mnemonicToSeed,
  mnemonicToSeedSync,
  validateMnemonic,
} from '../src.ts/bip39';
  
  describe('Mnemonic Utils', () => {
    describe('mnemonicToSeedSync', () => {
      it('should convert mnemonic to seed synchronously', () => {
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const password = 'password';
        const seed = mnemonicToSeedSync(mnemonic, password);
        expect(Buffer.isBuffer(seed)).toBe(true);
        expect(seed.length).toBeGreaterThan(0);
      });
    });
  
    describe('mnemonicToSeed', () => {
      it('should convert mnemonic to seed asynchronously', async () => {
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const password = 'password';
        const seed = await mnemonicToSeed(mnemonic, password);
        expect(Buffer.isBuffer(seed)).toBe(true);
        expect(seed.length).toBeGreaterThan(0);
      });
    });
  
    describe('mnemonicToEntropy', () => {
      it('should convert mnemonic to entropy', () => {
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const entropy = mnemonicToEntropy(mnemonic);
        expect(entropy.length).toBeGreaterThan(0);
        expect(entropy).toBe("6ce1535a6fdd4b10efae6f27fa0835b7");
      });
  
      it('should throw an error for invalid mnemonic', () => {
        const mnemonic = 'invalid mnemonic';
        expect(() => mnemonicToEntropy(mnemonic)).toThrowError('Invalid mnemonic');
      });
    });
  
    describe('entropyToMnemonic', () => {
      it('should convert entropy to mnemonic', () => {
        const entropy = 'c1f651a1fb62bebf8db1ecacf66a6a3d';
        const mnemonic = entropyToMnemonic(entropy);
        expect(mnemonic.length).toBeGreaterThan(0);
        expect(mnemonic).toBe("sea raw half walnut cloud garlic cycle diesel provide rebuild once key")
      });
  
      it('should throw an error for invalid entropy', () => {
        const entropy = 'invalid entropy';
        expect(() => entropyToMnemonic(entropy)).toThrowError('Invalid entropy');
      });
    });
  
    describe('generateMnemonic', () => {
      it('should generate a mnemonic phrase', () => {
        const mnemonic = generateMnemonic();
        expect(mnemonic.length).toBeGreaterThan(12);
      });
  
      it('should generate a mnemonic phrase with specified strength', () => {
        const strength = 256;
        const mnemonic = generateMnemonic(strength);
        expect(mnemonic.length).toBeGreaterThan(0);
      });
  
      it('should throw an error for invalid strength', () => {
        const strength = 123;
        expect(() => generateMnemonic(strength)).toThrowError('Invalid entropy');
      });
    });
  
    describe('validateMnemonic', () => {
      it('should return true for a valid mnemonic', () => {
        const mnemonic = 'hollow appear story text start mask salt social child space aspect hurdle';
        const isValid = validateMnemonic(mnemonic);
        expect(isValid).toBe(true);
      });
  
      it('should return false for an invalid mnemonic', () => {
        const mnemonic = 'invalid mnemonic';
        const isValid = validateMnemonic(mnemonic);
        expect(isValid).toBe(false);
      });
    });
  
    describe('getDefaultWordlist', () => {
      it('should return the default wordlist', () => {
        const language = getDefaultWordlist();
        expect(language).toBe("english");
      });
    });
  });
  