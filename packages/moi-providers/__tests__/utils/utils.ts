import { Signer } from "moi-signer";
import { Wallet } from "moi-wallet";
import { JsonRpcProvider } from "../../dist/jsonrpc-provider";

export const initializeWallet = async (provider: JsonRpcProvider): Promise<Signer> => {
    const mnemonic = "mother clarify push liquid ordinary social track brief exit fiction wheat forward";
    const derivationPath = "m/44'/6174'/0'/0/1";
    const wallet = new Wallet(provider);
    await wallet.fromMnemonic(mnemonic, derivationPath);

    return wallet;
}
