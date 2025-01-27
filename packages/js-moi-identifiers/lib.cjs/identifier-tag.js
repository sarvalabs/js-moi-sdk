"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierTag = exports.TagLogicIdV0 = exports.TagAssetV0 = exports.TagParticipantV0 = exports.IdentifierKind = void 0;
const js_moi_utils_1 = require("js-moi-utils");
var IdentifierKind;
(function (IdentifierKind) {
    IdentifierKind[IdentifierKind["Participant"] = 0] = "Participant";
    IdentifierKind[IdentifierKind["Asset"] = 1] = "Asset";
    IdentifierKind[IdentifierKind["Logic"] = 2] = "Logic";
})(IdentifierKind || (exports.IdentifierKind = IdentifierKind = {}));
const maxIdentifierKind = IdentifierKind.Logic;
const identifierV0 = 0;
/**
 * kindSupport is a map of IdentifierKind to the maximum supported version.
 */
const kindSupport = new Map([
    [IdentifierKind.Participant, 0],
    [IdentifierKind.Asset, 0],
    [IdentifierKind.Logic, 0],
]);
exports.TagParticipantV0 = (IdentifierKind.Participant << 4) | identifierV0;
exports.TagAssetV0 = (IdentifierKind.Asset << 4) | identifierV0;
exports.TagLogicIdV0 = (IdentifierKind.Logic << 4) | identifierV0;
class IdentifierTag {
    tag;
    constructor(tag) {
        this.tag = tag;
        const error = IdentifierTag.validate(this);
        if (error) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(error.message, "tag", tag);
        }
    }
    /**
     * Get the `IdentifierKind` from the `IdentifierTag`.
     * @returns The kind of identifier.
     */
    getKind() {
        return this.tag >> 4;
    }
    /**
     * Get the version of the `IdentifierTag`.
     *
     * @returns The version of the identifier.
     */
    getVersion() {
        return this.tag & 0x0f;
    }
    /**
     * Check if the `IdentifierTag` is valid and return an error if it is not.
     *
     * @param tag The `IdentifierTag` to validate.
     * @returns a error if the `IdentifierTag` is invalid, otherwise null.
     *
     * @throws if the version is not supported.
     * @throws if the kind is not supported.
     */
    static validate(tag) {
        if (tag.getKind() > maxIdentifierKind) {
            return new Error("Unsupported identifier kind.");
        }
        if (tag.getVersion() > (kindSupport.get(tag.getKind()) ?? 0)) {
            return new Error("Unsupported identifier version.");
        }
        return null;
    }
}
exports.IdentifierTag = IdentifierTag;
//# sourceMappingURL=identifier-tag.js.map