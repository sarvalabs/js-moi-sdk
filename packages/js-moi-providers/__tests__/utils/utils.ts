import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";
import { JsonRpcProvider } from "../../dist/jsonrpc-provider";

export const initializeWallet = async (provider: JsonRpcProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/0'/0/1";
    const wallet = new Wallet(provider);
    await wallet.fromMnemonic(mnemonic, derivationPath);

    return wallet;
}
