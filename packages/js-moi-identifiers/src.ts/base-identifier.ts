import { bytesToHex, ErrorUtils, hexToBytes, type Hex } from "js-moi-utils";
import { getFlag, type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import type { Identifier } from "./types/identifier";

export abstract class BaseIdentifier implements Identifier {
    private readonly value: Uint8Array;

    constructor(value: Uint8Array | Hex) {
        value = value instanceof Uint8Array ? value : hexToBytes(value);

        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }

        this.value = value;
    }

    public getFingerprint(): Uint8Array {
        return this.toBytes().slice(4, 28);
    }

    public getTag(): IdentifierTag {
        return BaseIdentifier.getTag(this.value);
    }

    public getVariant(): number {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }

    public hasFlag(flag: Flag): boolean {
        return flag.supports(this.getTag()) || getFlag(this.value[1], flag.index);
    }

    public toBytes(): Uint8Array {
        return this.value.slice();
    }

    public toHex(): Hex {
        return bytesToHex(this.value);
    }

    public toString(): string {
        return this.toHex();
    }

    public toJSON(): string {
        return this.toString();
    }

    protected static getTag(value: Uint8Array): IdentifierTag {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }

        return new IdentifierTag(value[0]);
    }
}
