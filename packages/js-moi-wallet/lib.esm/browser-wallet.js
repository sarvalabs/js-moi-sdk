import { Identifier } from "js-moi-identifiers";
import { BrowserProvider, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { bytesToHex, ErrorUtils } from "js-moi-utils";
/**
 * The `BrowserWallet` class extends the `Signer` class and provides functionality
 * for interacting with a browser-based wallet. It is designed to handle signing
 * operations, interaction requests, and execution of interactions with a blockchain
 * or decentralized application.
 *
 * This class is specifically tailored for use in browser environments and requires
 * a `BrowserProvider` to function correctly.
 *
 * @example
 * const identifier = "0x123...";
 * const wallet = new BrowserWallet(identifier, { provider });
 *
 * @extends Signer
 */
export class BrowserWallet extends Signer {
    identifier;
    /**
     * Constructs a new instance of the browser wallet.
     *
     * @param {Hex} identifier - A hexadecimal string representing the unique identifier for the wallet.
     * @param {WalletOption} option - An optional object containing additional options for the wallet.
     */
    constructor(identifier, option) {
        super(option?.provider);
        this.identifier = new Identifier(identifier);
    }
    async getKeyId() {
        const account = await this.getProvider().getWalletAccount(this.identifier);
        if (account == null) {
            ErrorUtils.throwError("Account not found in wallet extension.");
        }
        return account.keyId;
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
        const response = await provider.request("wallet.SignMessage", [hexEncodedMessage, this.identifier.toHex()]);
        return provider.processJsonRpcResponse(response);
    }
    async signInteraction(ix, _sig) {
        const provider = this.getProvider();
        const response = await provider.request("wallet.SignInteraction", [ix]);
        return provider.processJsonRpcResponse(response);
    }
    async execute(arg) {
        if ("interaction" in arg) {
            return await this.getProvider().execute(arg);
        }
        const provider = this.getProvider();
        const request = await this.createIxRequest("moi.Execute", arg);
        const response = await provider.request("wallet.SendInteraction", [request]);
        const hash = provider.processJsonRpcResponse(response);
        return new InteractionResponse(hash, provider);
    }
}
//# sourceMappingURL=browser-wallet.js.map