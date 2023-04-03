import { bytesToHex, decodeBase64 } from "moi-utils";

export class LogicId {
    private logicId: string;
    private logicIdInByte: Uint8Array;

    constructor(logicId: string) {
        this.logicId = logicId;
        this.logicIdInByte = decodeBase64(logicId)
    }

    // Valid returns true if the LogicID is valid, false otherwise.
    public isValid(): boolean {
        console.log(this.logicIdInByte[0] & 0xf0)
        if (this.logicIdInByte.length === 0) {
            return false;
        }
    
        // Calculate version of the LogicID
        // and check if there are enough bytes
        switch (this.logicIdInByte[0] & 0xf0) {
        case 0:
            return this.logicIdInByte.length === 35;
        default:
            return false;
        }
    }
  
    // Version returns the version of the LogicID.
    // Returns -1, if the LogicID is not valid
    public getVersion(): number {
        // Check validity
        if (!this.isValid()) {
            return -1;
        }
    
        // Determine the highest 4 bits of the first byte (v0)
        return this.logicIdInByte[0] & 0xf0;
    }

    public getLogicID(): string {
        return this.logicId;
    }
  
    // Address returns the address associated with the LogicID.
    // Returns NilAddress if the LogicID is invalid or the version is not 0.
    public getAddress(): string | null {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
            return null;
        }
    
        // Address data is everything after the third byte (v0)
        // We know it will be 32 bytes, because of the validity check
        const addressData = this.logicIdInByte.slice(3);
        // Convert address data into an Address and return
        return bytesToHex(addressData);
    }
}
