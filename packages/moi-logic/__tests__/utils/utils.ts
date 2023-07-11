import { Signer } from "moi-signer";
import { Wallet } from "moi-wallet";
import { JsonRpcProvider } from "moi-providers";

export const initializeWallet = async (provider: JsonRpcProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/0'/0/1";
    const wallet = new Wallet(provider);
    await wallet.fromMnemonic(mnemonic, derivationPath);

    return wallet;
}
