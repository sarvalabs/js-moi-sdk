"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetId = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const identifier_1 = require("./identifier");
const identifier_tag_1 = require("./identifier-tag");
class AssetId {
    buff;
    constructor(value) {
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid asset id length. Expected 32 bytes.", "value", value);
        }
        this.buff = value;
        const error = AssetId.validate(this);
        if (error != null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid asset identifier. ${error.message}`, "value", value);
        }
    }
    toBytes() {
        return this.buff;
    }
    toHex() {
        return (0, js_moi_utils_1.bytesToHex)(this.buff);
    }
    toIdentifier() {
        return new identifier_1.Identifier(this.buff);
    }
    getTag() {
        return new identifier_tag_1.IdentifierTag(this.buff[0]);
    }
    getFingerprint() {
        return new Uint8Array(this.buff.slice(4, 28));
    }
    getVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return new DataView(variant.buffer).getUint32(0, true);
    }
    getStandard() {
        const buff = this.toBytes().slice(2, 4);
        return new DataView(buff.buffer).getUint16(0, false);
    }
    getFlag(flag) {
        if (!flag.supports(this.getTag())) {
            return false;
        }
        return (0, flags_1.getFlag)(this.buff[1], flag.index);
    }
    isVariant() {
        const variant = new Uint8Array(this.buff.slice(28));
        return !(0, js_moi_utils_1.isNullBytes)(variant);
    }
    static validate(asset) {
        const tag = asset.getTag();
        const error = identifier_tag_1.IdentifierTag.validate(tag);
        if (error) {
            return error;
        }
        if (tag.getKind() !== enums_1.IdentifierKind.Asset) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }
        if ((asset[1] & (flags_1.flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }
        return null;
    }
    static fromHex(value) {
        return new AssetId((0, js_moi_utils_1.hexToBytes)(value));
    }
}
exports.AssetId = AssetId;
//# sourceMappingURL=asset-id.js.map