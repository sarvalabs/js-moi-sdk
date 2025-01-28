import { type Hex } from "js-moi-utils";
import { type Flag } from "../flags";
import type { IdentifierTag } from "../identifier-tag";

export interface InvalidReason {
    why: string;
}

export interface Identifier {
    toBytes(): Uint8Array;

    toHex(): Hex;

    getFingerprint(): Uint8Array;

    getTag(): IdentifierTag;

    getVariant(): number;

    hasFlag(flag: Flag): boolean;

    toString(): string;

    toJSON(): string;
}
