import { bytesToHex, ErrorUtils, hexToBytes, isNullBytes, type AssetStandard, type Hex } from "js-moi-utils";
import { flagMasks, getFlag, type Flag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierKind } from "./identifier-kind";
import { IdentifierTag } from "./identifier-tag";

export class AssetId {
    private readonly buff: Uint8Array;

    constructor(value: Uint8Array) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid asset id length. Expected 32 bytes.", "value", value);
        }

        this.buff = value;

        const error = AssetId.validate(this);

        if (error != null) {
            ErrorUtils.throwArgumentError(`Invalid asset identifier. ${error.message}`, "value", value);
        }
    }

    toBytes(): Uint8Array {
        return this.buff;
    }

    toHex(): Hex {
        return bytesToHex(this.buff);
    }

    public toIdentifier(): Identifier {
        return new Identifier(this.buff);
    }

    public getTag() {
        return new IdentifierTag(this.buff[0]);
    }

    public getFingerprint(): Uint8Array {
        return new Uint8Array(this.buff.slice(4, 28));
    }

    public getVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        ``;
        return new DataView(variant.buffer).getUint32(0, true);
    }

    public getStandard(): AssetStandard {
        console.log(this.toBytes());
        const buff = this.toBytes().slice(2, 4);
        console.log(buff);

        return new DataView(buff.buffer).getUint16(0, false);
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

    public static validate(asset: AssetId): Error | null {
        const tag = asset.getTag();
        const error = IdentifierTag.validate(tag);

        if (error) {
            return error;
        }

        if (tag.getKind() !== IdentifierKind.Asset) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }

        if ((asset[1] & (flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }

        return null;
    }

    public static fromHex(value: Hex): AssetId {
        return new AssetId(hexToBytes(value));
    }
}
