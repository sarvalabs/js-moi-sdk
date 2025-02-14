export class KramaIdMetadata {
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
//# sourceMappingURL=KramaIdMetadata.js.map