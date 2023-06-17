import { bytesToHex } from "moi-utils";

export class LogicId {
    private logic: Uint8Array;

    constructor(logicId: string) {
        this.logic = new Uint8Array(Buffer.from(logicId, "hex"))
    }

    // hex returns the LogicID as a hex encoded string
    public hex(): string {
        return Buffer.from(this.logic).toString('hex');
    }

    // isValid returns true if the LogicID is valid, false otherwise.
    public isValid(): boolean {
        if (this.logic.length === 0) {
            return false;
        }
    
        // Calculate version of the LogicID
        // and check if there are enough bytes
        switch (this.logic[0] & 0xf0) {
        case 0:
            return this.logic.length === 35;
        default:
            return false;
        }
    }
  
    // getVersion returns the version of the LogicID.
    // Returns -1, if the LogicID is not valid
    public getVersion(): number {
        // Check validity
        if (!this.isValid()) {
            return -1;
        }
    
        // Determine the highest 4 bits of the first byte (v0)
        return this.logic[0] & 0xf0;
    }

    // isStateful returns whether the stateful flag is set for the LogicID.
    // returns false if the LogicID is invalid.
    public isStateful(): boolean {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
          return false;
        }
    
        // Determine the 7th LSB of the first byte (v0)
        const bit = (this.logic[0] >> 1) & 0x1;
        // Return true if bit is set
        return bit !== 0;
    }

    // isInteractive returns whether the interactive flag is set for the LogicID.
    // returns false if the LogicID is invalid.
    public isInteractive(): boolean {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
          return false;
        }
    
        // Determine the 8th LSB of the first byte (v0)
        const bit = this.logic[0] & 0x1;
        // Return true if bit is set
        return bit !== 0;
    }

    // getEdition returns the edition number of the LogicID.
    // returns 0 if the LogicID is invalid.
    public getEdition(): number {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
          return 0;
        }
    
        // Edition data is in the second and third byte of the LogicID (v0)
        const editionBuf = this.logic.slice(1, 3);
        // Decode into 16-bit number
        const edition = new DataView(editionBuf.buffer).getUint16(0, false);
    
        return edition;
    }
  
    // getAddress returns the address associated with the LogicID.
    // returns NilAddress if the LogicID is invalid or the version is not 0.
    public getAddress(): string | null {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
            return null;
        }
    
        // address data is everything after the third byte (v0)
        // we know it will be 32 bytes, because of the validity check
        const addressData = this.logic.slice(3);

        // convert address data into an Address and return
        return bytesToHex(addressData);
    }
}