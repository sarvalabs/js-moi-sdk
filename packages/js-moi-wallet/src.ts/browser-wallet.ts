import { Identifier } from "js-moi-identifiers";
import { BrowserProvider, type ExecuteIx, type InteractionResponse } from "js-moi-providers";
import { Signer, type SignerIx, type SigType } from "js-moi-signer";
import { bytesToHex, ErrorUtils, type AnyIxOperation, type Hex, type InteractionRequest } from "js-moi-utils";
import type { WalletOption } from "../types/wallet";

export class BrowserWallet extends Signer {
    private readonly keyId: number;

    private readonly identifier: Identifier;

    constructor(identifier: Hex, option?: WalletOption) {
        super(option?.provider);

        this.identifier = new Identifier(identifier);
        this.keyId = option?.keyId ?? 0;
    }

    public async getKeyId(): Promise<number> {
        return this.keyId;
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

        return await provider.sign(hexEncodedMessage, this.identifier.toHex());
    }

    async signInteraction(ix: InteractionRequest, _sig: SigType): Promise<ExecuteIx> {
        const provider = this.getProvider();
        return await provider.signInteraction(ix);
    }

    async execute(arg: SignerIx<InteractionRequest> | AnyIxOperation | AnyIxOperation[] | ExecuteIx): Promise<InteractionResponse> {
        if ("interaction" in arg) {
            return await this.getProvider().execute(arg);
        }

        const request = await this.createIxRequest("moi.Execute", arg);
        return await this.getProvider().sendInteraction(request);
    }
}
