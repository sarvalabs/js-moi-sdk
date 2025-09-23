"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KramaIdMetadata = void 0;
const krama_id_enums_1 = require("./krama-id-enums");
/**
 * KramaIdMetadata provides a way to extract the network zone of a Krama ID.
 */
class KramaIdMetadata {
    value;
    constructor(value) {
        this.value = value;
        const result = KramaIdMetadata.validate(this);
        if (result !== null) {
            throw new Error(`Invalid Krama ID: ${result.why}`);
        }
    }
    /**
     * Retrieves the network zone of the Krama ID.
     *
     * @returns {NetworkZone} The network zone of the Krama ID, derived by shifting the value 4 bits to the right.
     */
    getZone() {
        return this.value >> 4;
    }
    static validate(metadata) {
        if (metadata.getZone() > krama_id_enums_1.NetworkZone.Zone3) {
            return { why: "Invalid network zone" };
        }
        return null;
    }
}
exports.KramaIdMetadata = KramaIdMetadata;
//# sourceMappingURL=krama-id-metadata.js.map