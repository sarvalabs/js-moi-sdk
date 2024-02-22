import { JsonRpcProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";

export const initializeWallet = async (provider: JsonRpcProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/7020'/0/0";
    const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);

    wallet.connect(provider);

    return wallet;
}