import { type Provider } from "js-moi-providers";

export interface FromMnemonicOptions {
    path?: string;
    provider?: Provider;
    words?: string[];
}
