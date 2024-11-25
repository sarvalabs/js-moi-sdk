import { Wallet } from "@zenz-solutions/js-moi-wallet";
import type { AbstractProvider } from "../../src.ts/abstract-provider";

export const initializeWallet = (provider: AbstractProvider, mnemonic: string): Wallet => {
    const derivationPath = "m/44'/6174'/7020'/0/0";
    const wallet =  Wallet.fromMnemonicSync(mnemonic, derivationPath);
    wallet.connect(provider);
    return wallet;
}

export const getRandomSupply = () => 100 + Math.floor(Math.random() * 900);
export const getRandomSymbol = () => "TEST #" + Math.floor(Math.random() * 1000);