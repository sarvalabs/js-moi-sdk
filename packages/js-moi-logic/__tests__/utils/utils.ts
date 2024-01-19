import { BaseProvider, JsonRpcProvider, VoyageProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";

export const initializeWallet = async (provider: BaseProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/7020'/0/0";
    const wallet = new Wallet(provider);
    await wallet.fromMnemonic(mnemonic, derivationPath);

    return wallet;
}

export const initializeProvider = (host?: string): BaseProvider => {
    return host ? new JsonRpcProvider(host) : new VoyageProvider("babylon");
}