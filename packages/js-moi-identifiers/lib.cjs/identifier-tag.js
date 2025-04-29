"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicTagV0 = exports.AssetTagV0 = exports.ParticipantTagV0 = exports.IdentifierTag = void 0;
const enums_1 = require("./enums");
class IdentifierTag {
    value;
    static maxIdentifierKind = enums_1.IdentifierKind.Logic;
    static kindMaxSupportedVersion = {
        [enums_1.IdentifierKind.Participant]: 0,
        [enums_1.IdentifierKind.Asset]: 0,
        [enums_1.IdentifierKind.Logic]: 0,
    };
    constructor(value) {
        const validation = IdentifierTag.validate(value);
        if (validation) {
            throw new Error(`Invalid identifier value. ${validation.why}`);
        }
        this.value = value;
    }
    getKind() {
        return IdentifierTag.getKind(this.value);
    }
    getVersion() {
        return IdentifierTag.getVersion(this.value);
    }
    static getKind(value) {
        return value >> 4;
    }
    static getVersion(value) {
        return value & 0x0f;
    }
    static getMaxSupportedVersion(kind) {
        return IdentifierTag.kindMaxSupportedVersion[kind];
    }
    static getTag(kind, version) {
        return new IdentifierTag((kind << 4) | version);
    }
    static validate(value) {
        if (IdentifierTag.getKind(value) > this.maxIdentifierKind) {
            return { why: "Unsupported identifier kind." };
        }
        if (IdentifierTag.getVersion(value) > IdentifierTag.getMaxSupportedVersion(IdentifierTag.getKind(value))) {
            return { why: "Unsupported identifier version." };
        }
        return null;
    }
}
exports.IdentifierTag = IdentifierTag;
exports.ParticipantTagV0 = IdentifierTag.getTag(enums_1.IdentifierKind.Participant, enums_1.IdentifierVersion.V0);
exports.AssetTagV0 = IdentifierTag.getTag(enums_1.IdentifierKind.Asset, enums_1.IdentifierVersion.V0);
exports.LogicTagV0 = IdentifierTag.getTag(enums_1.IdentifierKind.Logic, enums_1.IdentifierVersion.V0);
//# sourceMappingURL=identifier-tag.js.map