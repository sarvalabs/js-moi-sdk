import { AbstractProvider } from "js-moi-providers";

export interface WalletOption {
    keyId?: number;
    subAccountId?: number;
    provider?: AbstractProvider;
}

export interface MnemonicImportOptions extends WalletOption {
    words?: string[];
}
