"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantId = void 0;
const js_moi_utils_1 = require("js-moi-utils");
class ParticipantId {
    bytes;
    constructor(value) {
        if (typeof value === "string" && !(0, js_moi_utils_1.isHex)(value, 32)) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid hex value for participant id. Expected 32 bytes hex string.", "value", value);
        }
        if (value instanceof Uint8Array) {
            if (value.length !== 32) {
                js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid byte length for participant id. Expected 32 bytes.", "value", value);
            }
        }
        this.bytes = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
    }
    static validate(value) {
        if (typeof value === "string" && !(0, js_moi_utils_1.isHex)(value, 32)) {
            return new Error("Invalid hex value for participant id. Expected 32 bytes hex string.");
        }
        if (value instanceof Uint8Array && value.length !== 32) {
            return new Error("Invalid byte length for participant id. Expected 32 bytes.");
        }
        return null;
    }
}
exports.ParticipantId = ParticipantId;
//# sourceMappingURL=participants.js.map