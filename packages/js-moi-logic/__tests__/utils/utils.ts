import fs from "node:fs/promises";
import path from "node:path";

import type { LogicManifest } from "@zenz-solutions/js-moi-manifest";
import { JsonRpcProvider } from "@zenz-solutions/js-moi-providers";
import { Signer } from "@zenz-solutions/js-moi-signer";
import { Wallet } from "@zenz-solutions/js-moi-wallet";

export const initializeWallet = async (provider: JsonRpcProvider, mnemonic: string): Promise<Signer> => {
    const derivationPath = "m/44'/6174'/7020'/0/0";
    const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);

    wallet.connect(provider);

    return wallet;
}

export const loadManifestFromFile = async (filepath: string): Promise<LogicManifest.Manifest> => {
    filepath = path.resolve(__dirname, filepath);
    
    const blob = await fs.readFile(filepath, "utf-8");
    return JSON.parse(blob);
}