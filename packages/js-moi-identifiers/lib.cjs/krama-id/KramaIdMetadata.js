"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KramaIdMetadata = void 0;
class KramaIdMetadata {
    value;
    constructor(value) {
        this.value = value;
        if (this.getZone() > NetworkZone.Zone3) {
            throw new Error("Invalid network zone");
        }
    }
    getZone() {
        return this.value >> 4;
    }
}
exports.KramaIdMetadata = KramaIdMetadata;
//# sourceMappingURL=KramaIdMetadata.js.map