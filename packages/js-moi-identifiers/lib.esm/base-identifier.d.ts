import { type Hex } from "js-moi-utils";
import { type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import type { Identifier } from "./types/identifier";
export declare abstract class BaseIdentifier implements Identifier {
    private readonly value;
    constructor(value: Uint8Array | Hex);
    getFingerprint(): Uint8Array;
    getTag(): IdentifierTag;
    getVariant(): number;
    hasFlag(flag: Flag): boolean;
    toBytes(): Uint8Array;
    toHex(): Hex;
    toString(): string;
    toJSON(): string;
    protected static getTag(value: Uint8Array): IdentifierTag;
}
//# sourceMappingURL=base-identifier.d.ts.map