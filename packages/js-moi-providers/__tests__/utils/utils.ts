import { Wallet } from "js-moi-wallet";
import type { AbstractProvider } from "../../src.ts/abstract-provider";

export const initializeWallet = (provider: AbstractProvider, mnemonic: string): Wallet => {
    console.log("mnemonic", mnemonic);
    console.log("process.env.DEVIATION_PATH", process.env.DEVIATION_PATH);
    const wallet =  Wallet.fromMnemonicSync(mnemonic, process.env.DEVIATION_PATH);
    wallet.connect(provider);
    return wallet;
}

export const getRandomSupply = () => 100 + Math.floor(Math.random() * 900);
export const getRandomSymbol = () => "TEST #" + Math.floor(Math.random() * 1000);