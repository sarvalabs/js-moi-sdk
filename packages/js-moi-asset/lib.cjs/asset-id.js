"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetId = void 0;
const buffer_1 = require("buffer");
const js_moi_utils_1 = require("js-moi-utils");
/**
 * Represents a AssetID, which is an identifier for a asset.
 */
class AssetId {
    asset;
    constructor(assetId) {
        this.asset = (0, js_moi_utils_1.hexToBytes)(assetId);
    }
    /**
     * Returns the LogicID as a hex encoded string.
     *
     * @returns {string} The LogicID as a hex encoded string.
     */
    hex() {
        return "0x" + buffer_1.Buffer.from(this.asset).toString('hex');
    }
    /**
     * Returns the LogicID as a hex encoded string without 0x prefix.
     *
     * @returns {string} The LogicID as a hex encoded string.
     */
    string() {
        return buffer_1.Buffer.from(this.asset).toString('hex');
    }
    /**
     * Checks if the LogicID is valid.
     *
     * @returns {boolean} True if the LogicID is valid, false otherwise.
     */
    isValid() {
        if (this.asset.length === 0) {
            return false;
        }
        // Calculate version of the LogicID and check if there are enough bytes
        switch (this.asset[0] & 0xf0) {
            case 0:
                return this.asset.length === 35;
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
    getVersion() {
        // Check validity
        if (!this.isValid()) {
            return -1;
        }
        // Determine the highest 4 bits of the first byte (v0)
        return this.asset[0] & 0xf0;
    }
    /**
     * Checks if the stateful flag is set for the LogicID.
     * Returns false if the LogicID is invalid.
     *
     * @returns {boolean} True if the stateful flag is set, false otherwise.
     */
    isStateful() {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
            return false;
        }
        // Determine the 7th LSB of the first byte (v0)
        const bit = (this.asset[0] >> 1) & 0x1;
        // Return true if bit is set
        return bit !== 0;
    }
    /**
     * Checks if the interactive flag is set for the LogicID.
     * Returns false if the LogicID is invalid.
     *
     * @returns {boolean} True if the interactive flag is set, false otherwise.
     */
    isInteractive() {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
            return false;
        }
        // Determine the 8th LSB of the first byte (v0)
        const bit = this.asset[0] & 0x1;
        // Return true if bit is set
        return bit !== 0;
    }
    /**
     * Returns the edition number of the LogicID.
     * Returns 0 if the LogicID is invalid.
     *
     * @returns {number} The edition number of the LogicID.
     */
    getEdition() {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
            return 0;
        }
        // Edition data is in the second and third byte of the LogicID (v0)
        const editionBuf = this.asset.slice(1, 3);
        // Decode into 16-bit number
        const edition = new DataView(editionBuf.buffer).getUint16(0, false);
        return edition;
    }
    /**
     * Returns the address associated with the LogicID.
     * Returns null if the LogicID is invalid or the version is not 0.
     *
     * @returns {string | null} The address associated with the LogicID, or
     null if not applicable.
     */
    getAddress() {
        // Check logic version, internally checks validity
        if (this.getVersion() !== 0) {
            return null;
        }
        // address data is everything after the third byte (v0)
        // we know it will be 32 bytes, because of the validity check
        const addressData = this.asset.slice(3);
        // convert address data into an Address and return
        return (0, js_moi_utils_1.bytesToHex)(addressData);
    }
}
exports.AssetId = AssetId;
//# sourceMappingURL=asset-id.js.map