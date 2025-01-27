import { ErrorUtils, hexToBytes, isHex, type Hex } from "js-moi-utils";

export class ParticipantId {
    private readonly bytes: Uint8Array
    
    constructor(value: Uint8Array | Hex) {
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

    public static validate(value: Uint8Array | Hex): Error | null {
        if (typeof value === "string" && !isHex(value, 32)) {
            return new Error("Invalid hex value for participant id. Expected 32 bytes hex string.");
        }

        if (value instanceof Uint8Array && value.length !== 32) {
                return new Error("Invalid byte length for participant id. Expected 32 bytes.");
        }

        return null;
    }
}
