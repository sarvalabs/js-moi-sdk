"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIdentifier = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const flags_1 = require("./flags");
const identifier_tag_1 = require("./identifier-tag");
class BaseIdentifier {
    value;
    constructor(value) {
        value = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        this.value = value;
    }
    getFingerprint() {
        return this.toBytes().slice(4, 28);
    }
    getTag() {
        return BaseIdentifier.getTag(this.value);
    }
    getVariant() {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }
    hasFlag(flag) {
        return flag.supports(this.getTag()) || (0, flags_1.getFlag)(this.value[1], flag.index);
    }
    toBytes() {
        return this.value.slice();
    }
    toHex() {
        return (0, js_moi_utils_1.bytesToHex)(this.value);
    }
    toString() {
        return this.toHex();
    }
    toJSON() {
        return this.toString();
    }
    static getTag(value) {
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        return new identifier_tag_1.IdentifierTag(value[0]);
    }
}
exports.BaseIdentifier = BaseIdentifier;
//# sourceMappingURL=base-identifier.js.map