import { Identifier } from "js-moi-identifiers";
import { BrowserProvider, type ExecuteIx, type InteractionResponse } from "js-moi-providers";
import { Signer, type SignerIx, type SigType } from "js-moi-signer";
import { type AnyIxOperation, type Hex, type InteractionRequest } from "js-moi-utils";
import type { WalletOption } from "../types/wallet";
export declare class BrowserWallet extends Signer {
    private readonly keyId;
    private readonly identifier;
    constructor(identifier: Hex, option?: WalletOption);
    getKeyId(): Promise<number>;
    getIdentifier(): Promise<Identifier>;
    getProvider(): BrowserProvider;
    sign(message: Hex | Uint8Array, _sig: SigType): Promise<Hex>;
    signInteraction(ix: InteractionRequest, _sig: SigType): Promise<ExecuteIx>;
    execute(arg: SignerIx<InteractionRequest> | AnyIxOperation | AnyIxOperation[] | ExecuteIx): Promise<InteractionResponse>;
}
//# sourceMappingURL=browser-wallet.d.ts.map