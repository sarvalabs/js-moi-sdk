import { bytesToHex, ErrorUtils, hexToBytes, isNullBytes, type Hex } from "js-moi-utils";
import { flagMasks, getFlag, type Flag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierKind } from "./identifier-kind";
import { IdentifierTag } from "./identifier-tag";

export class LogicId {
    private readonly buff: Uint8Array;

    constructor(value: Uint8Array) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid logic id length. Expected 32 bytes.", "value", value);
        }

        this.buff = value;

        const error = LogicId.validate(this);

        if (error != null) {
            ErrorUtils.throwArgumentError(`Invalid logic identifier. ${error.message}`, "value", value);
        }
    }

    toBytes(): Uint8Array {
        return this.buff;
    }

    toHex(): Hex {
        return bytesToHex(this.buff);
    }

    public toIdentifier(): Identifier {
        return new Identifier(this.toBytes());
    }

    public getTag() {
        return new IdentifierTag(this.buff[0]);
    }

    public getFingerprint(): Uint8Array {
        return new Uint8Array(this.buff.slice(4, 28));
    }

    public getVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return new DataView(variant.buffer).getUint32(0, true);
    }

    public getFlag(flag: Flag) {
        if (!flag.supports(this.getTag())) {
            return false;
        }

        return getFlag(this.buff[1], flag.index);
    }

    public isVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return !isNullBytes(variant);
    }

    public static validate(logicId: LogicId): Error | null {
        const tag = logicId.getTag();
        const error = IdentifierTag.validate(tag);

        if (error) {
            return error;
        }

        if (tag.getKind() !== IdentifierKind.Logic) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }

        if ((logicId[1] & (flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }

        return null;
    }

    public static fromHex(value: Hex): LogicId {
        return new LogicId(hexToBytes(value));
    }
}
