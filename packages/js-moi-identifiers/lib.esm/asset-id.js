import { bytesToHex, ErrorUtils, hexToBytes, isNullBytes } from "js-moi-utils";
import { flagMasks, getFlag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierKind } from "./identifier-kind";
import { IdentifierTag } from "./identifier-tag";
export class AssetId {
    buff;
    constructor(value) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid asset id length. Expected 32 bytes.", "value", value);
        }
        this.buff = value;
        const error = AssetId.validate(this);
        if (error != null) {
            ErrorUtils.throwArgumentError(`Invalid asset identifier. ${error.message}`, "value", value);
        }
    }
    toBytes() {
        return this.buff;
    }
    toHex() {
        return bytesToHex(this.buff);
    }
    toIdentifier() {
        return new Identifier(this.buff);
    }
    getTag() {
        return new IdentifierTag(this.buff[0]);
    }
    getFingerprint() {
        return new Uint8Array(this.buff.slice(4, 28));
    }
    getVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        ``;
        return new DataView(variant.buffer).getUint32(0, true);
    }
    getStandard() {
        console.log(this.toBytes());
        const buff = this.toBytes().slice(2, 4);
        console.log(buff);
        return new DataView(buff.buffer).getUint16(0, false);
    }
    getFlag(flag) {
        if (!flag.supports(this.getTag())) {
            return false;
        }
        return getFlag(this.buff[1], flag.index);
    }
    isVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return !isNullBytes(variant);
    }
    static validate(asset) {
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
    static fromHex(value) {
        return new AssetId(hexToBytes(value));
    }
}
//# sourceMappingURL=asset-id.js.map