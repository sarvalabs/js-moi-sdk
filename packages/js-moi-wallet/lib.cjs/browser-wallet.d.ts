import { Identifier } from "js-moi-identifiers";
import { BrowserProvider, type ExecuteIx, type InteractionResponse } from "js-moi-providers";
import { Signer, type SignerIx, type SigType } from "js-moi-signer";
import { type AnyIxOperation, type Hex, type InteractionRequest } from "js-moi-utils";
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
export declare class BrowserWallet extends Signer {
    private readonly keyId;
    private readonly identifier;
    /**
     * Constructs a new instance of the browser wallet.
     *
     * @param {Hex} identifier - A hexadecimal string representing the unique identifier for the wallet.
     * @param {WalletOption} option - An optional object containing additional options for the wallet.
     */
    constructor(identifier: Hex, option?: WalletOption);
    getKeyId(): Promise<number>;
    getIdentifier(): Promise<Identifier>;
    getProvider(): BrowserProvider;
    sign(message: Hex | Uint8Array, _sig: SigType): Promise<Hex>;
    signInteraction(ix: InteractionRequest, _sig: SigType): Promise<ExecuteIx>;
    execute(arg: SignerIx<InteractionRequest> | AnyIxOperation | AnyIxOperation[] | ExecuteIx): Promise<InteractionResponse>;
}
//# sourceMappingURL=browser-wallet.d.ts.map