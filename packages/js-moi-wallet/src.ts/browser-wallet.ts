import { Identifier } from "js-moi-identifiers";
import { BrowserProvider, InteractionResponse, type ExecuteIx } from "js-moi-providers";
import { Signer, type SignerIx, type SigType } from "js-moi-signer";
import { bytesToHex, ErrorUtils, type AnyIxOperation, type Hex, type InteractionRequest } from "js-moi-utils";
import type { WalletOption } from "../types/wallet";

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
    private readonly identifier: Identifier;

    private readonly keyIndex: number = 0;

    /**
     * Constructs a new instance of the browser wallet.
     *
     * @param {Hex} identifier - A hexadecimal string representing the unique identifier for the wallet.
     * @param {WalletOption} option - An optional object containing additional options for the wallet.
     */
    constructor(identifier: Hex, option?: WalletOption) {
        super(option?.provider);

        this.identifier = new Identifier(identifier);
        this.keyIndex = option?.keyId ?? 0;
    }

    /**
     * Returns the key index of the wallet.
     *
     * @returns {number} The key index of the wallet.
     */
    public getKeyId(): Promise<number> {
        return Promise.resolve(this.keyIndex);
    }

    public async getIdentifier(): Promise<Identifier> {
        return this.identifier;
    }

    public override getProvider(): BrowserProvider {
        const provider = super.getProvider();

        if (!(provider instanceof BrowserProvider)) {
            ErrorUtils.throwError("Invalid provider type. Expected instance of 'BrowserProvider'.");
        }

        return provider;
    }

    async sign(message: Hex | Uint8Array, _sig: SigType): Promise<Hex> {
        const provider = this.getProvider();
        const hexEncodedMessage = message instanceof Uint8Array ? bytesToHex(message) : message;
        const response = await provider.request<Hex>("wallet.SignMessage", [hexEncodedMessage, this.identifier.toHex()]);

        return provider.processJsonRpcResponse(response);
    }

    async signInteraction(ix: InteractionRequest, _sig: SigType): Promise<ExecuteIx> {
        const provider = this.getProvider();
        const response = await provider.request<ExecuteIx>("wallet.SignInteraction", [ix]);
        return provider.processJsonRpcResponse(response);
    }

    async execute(arg: SignerIx<InteractionRequest> | AnyIxOperation | AnyIxOperation[] | ExecuteIx): Promise<InteractionResponse> {
        if ("interaction" in arg) {
            return await this.getProvider().execute(arg);
        }

        const provider = this.getProvider();
        const request = await this.createIxRequest("moi.Execute", arg);
        const response = await provider.request<Hex>("wallet.SendInteraction", [request]);
        const hash = provider.processJsonRpcResponse(response);

        return new InteractionResponse(hash, provider);
    }
}
