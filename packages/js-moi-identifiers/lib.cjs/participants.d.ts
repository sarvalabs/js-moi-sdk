import { type Hex } from "js-moi-utils";
export declare class ParticipantId {
    private readonly bytes;
    constructor(value: Uint8Array | Hex);
    static validate(value: Uint8Array | Hex): Error | null;
}
//# sourceMappingURL=participants.d.ts.map