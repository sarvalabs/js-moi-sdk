import { ErrorUtils, hexToBytes, isHex } from "js-moi-utils";
import { IdentifierTag } from "./identifier-tag";
export class ParticipantId {
    bytes;
    constructor(value) {
        if (typeof value === "string" && !isHex(value, 32)) {
            ErrorUtils.throwArgumentError("Invalid hex value for participant id. Expected 32 bytes hex string.", "value", value);
        }
        if (value instanceof Uint8Array) {
            if (value.length !== 32) {
                ErrorUtils.throwArgumentError("Invalid byte length for participant id. Expected 32 bytes.", "value", value);
            }
        }
        this.bytes = value instanceof Uint8Array ? value : hexToBytes(value);
    }
    static validate(value) {
        if (typeof value === "string" && !isHex(value, 32)) {
            return new Error("Invalid hex value for participant id. Expected 32 bytes hex string.");
        }
        if (value instanceof Uint8Array && value.length !== 32) {
            return new Error("Invalid byte length for participant id. Expected 32 bytes.");
        }
        return IdentifierTag.validate();
    }
}
//# sourceMappingURL=participants.js.map