import { bytesToHex, ErrorUtils, hexToBytes } from "js-moi-utils";
import { getFlag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
export class BaseIdentifier {
    value;
    constructor(value) {
        value = value instanceof Uint8Array ? value : hexToBytes(value);
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
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
        return flag.supports(this.getTag()) || getFlag(this.value[1], flag.index);
    }
    toBytes() {
        return this.value.slice();
    }
    toHex() {
        return bytesToHex(this.value);
    }
    toString() {
        return this.toHex();
    }
    toJSON() {
        return this.toString();
    }
    static getTag(value) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        return new IdentifierTag(value[0]);
    }
}
//# sourceMappingURL=base-identifier.js.map