export interface Keystore {
    cipher: string;
    ciphertext: string;
    cipherparams: {
      IV: string;
    };
    kdf: string;
    kdfparams: {
      dklen: number;
      n: number;
      p: number;
      r: number;
      salt: string;
    };
    mac: string;
}