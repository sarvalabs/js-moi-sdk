"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KramaIdTag = void 0;
const krama_id_enums_1 = require("./krama-id-enums");
class KramaIdTag {
    value;
    static kindMaxSupportedVersion = {
        [krama_id_enums_1.KramaIdKind.Guardian]: krama_id_enums_1.KramaIdVersion.V0,
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
        if (tag.getKind() > krama_id_enums_1.KramaIdKind.Guardian) {
            return { why: "Unsupported KramaId kind" };
        }
        if (tag.getVersion() > this.kindMaxSupportedVersion[tag.getKind()]) {
            return { why: "Unsupported KramaId version" };
        }
        return null;
    }
}
exports.KramaIdTag = KramaIdTag;
//# sourceMappingURL=KramaIdTag.js.map