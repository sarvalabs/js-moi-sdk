import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";
import { JsonRpcProvider } from "../../src.ts/jsonrpc-provider";

export const initializeWallet = async (provider: JsonRpcProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/0'/0/1";
    
    const wallet =  await Wallet.fromMnemonic(mnemonic, derivationPath);
    wallet.connect(provider);

    return wallet;
}

export const getRandomSupply = () => 100 + Math.floor(Math.random() * 900);
export const getRandomSymbol = () => "TEST #" + Math.floor(Math.random() * 1000);