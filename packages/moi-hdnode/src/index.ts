import HDKey from "hdkey";
import * as bip39 from 'bip39';
import { MOI_DERIVATION_PATH } from "moi-constants";

export class HDNode {
  private node: HDKey;

  constructor() {}

  public async mnemonicToSeed(mnemonic: string, wordlist?: undefined) {
    try {
      mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
      return await bip39.mnemonicToSeed(mnemonic, undefined);
    } catch(err) {
      throw err;
    }
  }

  public fromSeed(seed: Buffer, path?: string) {
    try {
      const masterHdNode = HDKey.fromMasterSeed(seed, undefined);
      this.node = masterHdNode.derive(path ? path : MOI_DERIVATION_PATH);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  public fromExtendedKey(extendedKey: string) {
    try {
      const hdNode = HDKey.fromExtendedKey(extendedKey, undefined);
      this.node = hdNode.derive(MOI_DERIVATION_PATH);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  public derivePath(path: string) {
    if (!this.node) {
      throw new Error("HDNode not initialized");
    }
    return this.node.derive(path);
  }

  public publicKey() {
    return this.node._publicKey;
  }

  public privateKey() {
    return this.node._privateKey;
  }
}
