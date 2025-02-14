import { KramaIdKind, KramaIdVersion } from "./krama-id-enums";
export class KramaIdTag {
    value;
    static kindMaxSupportedVersion = {
        [KramaIdKind.Guardian]: KramaIdVersion.V0,
    };
    constructor(value) {
        this.value = value;
        const error = KramaIdTag.validate(this);
        if (error) {
            throw new Error(`Invalid KramaIdTag: ${error.why}`);
        }
    }
    getKind() {
        return this.value >> 4;
    }
    getVersion() {
        return this.value & 0x0f;
    }
    static validate(tag) {
        if (tag.getKind() > KramaIdKind.Guardian) {
            return { why: "Unsupported KramaId kind" };
        }
        if (tag.getVersion() > this.kindMaxSupportedVersion[tag.getKind()]) {
            return { why: "Unsupported KramaId version" };
        }
        return null;
    }
}
//# sourceMappingURL=KramaIdTag.js.map