import { ParticipantCreatePayload, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { type Hex } from "js-moi-utils";
export declare class ParticipantCreate {
    private _id?;
    private _keys;
    private _value?;
    private signer;
    constructor(signer: Signer);
    id(id: Hex): this;
    addKey(publicKey: Hex, weight: number, signatureAlgorithm?: number): this;
    value(assetId: Hex, callsite: string, funds: Record<Hex, number | bigint>, calldata?: Hex): this;
    build(): ParticipantCreatePayload;
    send(): Promise<InteractionResponse>;
}
//# sourceMappingURL=participant.d.ts.map