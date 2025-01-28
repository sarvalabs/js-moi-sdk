"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAssetId = exports.assetId = exports.AssetId = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const base_identifier_1 = require("./base-identifier");
const enums_1 = require("./enums");
const flags_1 = require("./flags");
class AssetId extends base_identifier_1.BaseIdentifier {
    constructor(value) {
        super(value);
        const error = AssetId.validate(this.toBytes());
        if (error) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid asset identifier. ${error.why}`, "value", value);
        }
    }
    /**
     * Retrieves the standard of the asset.
     *
     * This method extracts a 16-bit unsigned integer from the byte representation
     * of the asset, starting from the 3rd byte (index 2) to the 4th byte (index 3).
     * The extracted value represents the asset standard.
     *
     * @returns {AssetStandard} The standard of the asset as a 16-bit unsigned integer.
     */
    getStandard() {
        return new DataView(this.toBytes().slice(2, 4).buffer).getUint16(0, false);
    }
    static validate(value) {
        const asset = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
        const tag = this.getTag(asset);
        const kind = tag.getKind();
        if (kind !== enums_1.IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a asset identifier." };
        }
        const hasUnsupportedFlags = (asset[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
}
exports.AssetId = AssetId;
/**
 * Generates an `Identifier` for a given asset.
 *
 * @param value - The value of the asset, which can be either a `Uint8Array` or a `Hex` string.
 * @returns An `Identifier` representing the asset.
 */
const assetId = (value) => {
    return new AssetId(value);
};
exports.assetId = assetId;
/**
 * Checks if the given identifier is an instance of AssetId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of AssetId, otherwise false.
 */
const isAssetId = (value) => {
    return value instanceof AssetId;
};
exports.isAssetId = isAssetId;
//# sourceMappingURL=asset-id.js.map