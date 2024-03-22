import fs from "node:fs/promises";
import path from "node:path";

import type { LogicManifest } from "js-moi-manifest";
import { JsonRpcProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";

export const initializeWallet = async (provider: JsonRpcProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/7020'/0/0";
    const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);

    wallet.connect(provider);

    return wallet;
}

export const loadManifestFromFile = async (filepath: string): Promise<LogicManifest.Manifest> => {
    filepath = path.resolve(__dirname, filepath);

    console.log(filepath);
    const blob = await fs.readFile(filepath, "utf-8");
    return JSON.parse(blob);
}