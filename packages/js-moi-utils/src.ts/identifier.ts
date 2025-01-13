import { bytesToHex, ensureHexPrefix, hexToBytes } from "./hex";

export class LogicId {
    private logic: Uint8Array;

    constructor(logicId: string) {
        this.logic = hexToBytes(ensureHexPrefix(logicId));
    }

    /**
     * Returns the LogicID as a hex encoded string.
     *
     * @returns {string} The LogicID as a hex encoded string.
     */
    public hex(): string {
        return bytesToHex(this.logic);
    }

    /**
     * Checks if the LogicID is valid.
     *
     * @returns {boolean} True if the LogicID is valid, false otherwise.
     */
    public isValid(): boolean {
        if (this.logic.length === 0) {
            return false;
        }

        // Calculate version of the LogicID and check if there are enough bytes
        switch (this.logic[0] & 0xf0) {
            case 0:
                return this.logic.length === 35;
            default:
                return false;
        }
    }

    /**
     * Returns the version of the LogicID.
     * Returns -1 if the LogicID is not valid.
     *
     * @returns {number} The version of the LogicID.
     */
    public getVersion(): number {
        // Check validity
        if (!this.isValid()) {
            return -1;
        }

        // Determine the highest 4 bits of the first byte (v0)
        return this.logic[0] & 0xf0;
    }

    /**
     * Checks if the stateful flag is set for the LogicID.
     * Returns false if the LogicID is invalid.
     *
     * @returns {boolean} True if the stateful flag is set, false otherwise.
     */
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

    /**
     * Checks if the interactive flag is set for the LogicID.
     * Returns false if the LogicID is invalid.
     *
     * @returns {boolean} True if the interactive flag is set, false otherwise.
     */
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

    /**
     * Returns the edition number of the LogicID.
     * Returns 0 if the LogicID is invalid.
     *
     * @returns {number} The edition number of the LogicID.
     */
    public getEdition(): number {
        if (this.getVersion() !== 0) {
            return 0;
        }

        const editionBuf = this.logic.slice(1, 3);
        const edition = new DataView(editionBuf.buffer).getUint16(0, false);

        return edition;
    }

    /**
     * Returns the address associated with the LogicID.
     * Returns null if the LogicID is invalid or the version is not 0.
     *
     * @returns {string | null} The address associated with the LogicID, or null if not applicable.
     */
    public getAddress(): string | null {
        if (this.getVersion() !== 0) {
            return null;
        }

        const addressData = this.logic.slice(3);

        return bytesToHex(addressData);
    }
}
