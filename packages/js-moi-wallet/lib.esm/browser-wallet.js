import { Identifier } from "js-moi-identifiers";
import { BrowserProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { bytesToHex, ErrorUtils } from "js-moi-utils";
export class BrowserWallet extends Signer {
    keyId;
    identifier;
    constructor(identifier, option) {
        super(option?.provider);
        this.identifier = new Identifier(identifier);
        this.keyId = option?.keyId ?? 0;
    }
    async getKeyId() {
        return this.keyId;
    }
    async getIdentifier() {
        return this.identifier;
    }
    getProvider() {
        const provider = super.getProvider();
        if (!(provider instanceof BrowserProvider)) {
            ErrorUtils.throwError("Invalid provider type. Expected instance of 'BrowserProvider'.");
        }
        return provider;
    }
    async sign(message, _sig) {
        const provider = this.getProvider();
        const hexEncodedMessage = message instanceof Uint8Array ? bytesToHex(message) : message;
        return await provider.sign(hexEncodedMessage, this.identifier.toHex());
    }
    async signInteraction(ix, _sig) {
        const provider = this.getProvider();
        return await provider.signInteraction(ix);
    }
    async execute(arg) {
        if ("interaction" in arg) {
            return await this.getProvider().execute(arg);
        }
        const request = await this.createIxRequest("moi.Execute", arg);
        return await this.getProvider().sendInteraction(request);
    }
}
//# sourceMappingURL=browser-wallet.js.map