import { type Hex } from "js-moi-utils";
import { type Flag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierTag } from "./identifier-tag";
export declare class LogicId {
    private readonly buff;
    constructor(value: Uint8Array);
    toBytes(): Uint8Array;
    toHex(): Hex;
    toIdentifier(): Identifier;
    getTag(): IdentifierTag;
    getFingerprint(): Uint8Array;
    getVariant(): number;
    getFlag(flag: Flag): boolean;
    isVariant(): boolean;
    static validate(logicId: LogicId): Error | null;
    static fromHex(value: Hex): LogicId;
}
//# sourceMappingURL=logic-id.d.ts.map