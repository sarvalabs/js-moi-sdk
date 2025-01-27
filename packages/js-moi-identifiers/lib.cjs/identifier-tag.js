"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagLogicV0 = exports.TagAssetV0 = exports.TagParticipantV0 = exports.IdentifierTag = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const identifier_kind_1 = require("./identifier-kind");
const maxIdentifierKind = identifier_kind_1.IdentifierKind.Logic;
const identifierV0 = 0;
/**
 * kindSupport is a map of IdentifierKind to the maximum supported version.
 */
const kindSupport = new Map([
    [identifier_kind_1.IdentifierKind.Participant, 0],
    [identifier_kind_1.IdentifierKind.Asset, 0],
    [identifier_kind_1.IdentifierKind.Logic, 0],
]);
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
    getValue() {
        return this.tag;
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
exports.TagParticipantV0 = new IdentifierTag((identifier_kind_1.IdentifierKind.Participant << 4) | identifierV0);
exports.TagAssetV0 = new IdentifierTag((identifier_kind_1.IdentifierKind.Asset << 4) | identifierV0);
exports.TagLogicV0 = new IdentifierTag((identifier_kind_1.IdentifierKind.Logic << 4) | identifierV0);
//# sourceMappingURL=identifier-tag.js.map