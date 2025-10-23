import { InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType, type Hex } from "js-moi-utils";
import { InteractionContext } from "./context";
export declare class ParticipantCreate {
    private _id?;
    private _keys;
    private _value?;
    private signer;
    constructor(signer: Signer);
    id(id: Hex): ParticipantCreate;
    addKey(publicKey: Hex, weight: number, signatureAlgorithm?: number): ParticipantCreate;
    value(assetId: Hex, beneficiary: Hex, amount: number | bigint): ParticipantCreate;
    build(): InteractionContext<OpType.PARTICIPANT_CREATE>;
    send(): Promise<InteractionResponse>;
}
//# sourceMappingURL=participant.d.ts.map