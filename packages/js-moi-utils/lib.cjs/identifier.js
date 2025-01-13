"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicId = void 0;
const errors_1 = require("./errors");
const hex_1 = require("./hex");
class LogicId {
    value;
    constructor(value) {
        if (!LogicId.isValid(value)) {
            errors_1.ErrorUtils.throwArgumentError("Invalid LogicId", "value", value);
        }
        this.value = (0, hex_1.ensureHexPrefix)(value);
    }
    isPersistent() {
        const bit = (this.getBytes()?.[0] >> 3) & 0x1;
        return bit != 0;
    }
    isEphemeral() {
        const bit = (this.getBytes()?.[0] >> 2) & 0x1;
        return bit != 0;
    }
    isIntractable() {
        const bit = (this.getBytes()?.[0] >> 1) & 0x1;
        return bit != 0;
    }
    isAssetLogic() {
        const bit = this.getBytes()?.[0] & 0x1;
        return bit != 0;
    }
    getEdition() {
        const blob = this.getBytes().slice(1, 3);
        return new DataView(blob.buffer).getUint16(0, false);
    }
    getBytes() {
        return (0, hex_1.hexToBytes)(this.value);
    }
    getAddress() {
        return (0, hex_1.ensureHexPrefix)(this.value.slice(this.value.length - 64));
    }
    toString() {
        return this.value;
    }
    getVersion() {
        return 0;
    }
    static isValid(value) {
        if (!(0, hex_1.isHex)(value) || value.length % 2 !== 0) {
            return false;
        }
        const bytes = (0, hex_1.hexToBytes)(value);
        if (bytes.length < 1) {
            return false;
        }
        const version = bytes[0] & 0xf0;
        switch (version) {
            case 0: {
                return bytes.length === 35;
            }
            default: {
                return false;
            }
        }
    }
}
exports.LogicId = LogicId;
//# sourceMappingURL=identifier.js.map