import { ErrorUtils, hexToBytes } from "js-moi-utils";
import { BaseIdentifier } from "./base-identifier";
import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
export class AssetId extends BaseIdentifier {
    constructor(value) {
        super(value);
        const error = AssetId.validate(this.toBytes());
        if (error) {
            ErrorUtils.throwArgumentError(`Invalid asset identifier. ${error.why}`, "value", value);
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
        const asset = value instanceof Uint8Array ? value : hexToBytes(value);
        const tag = this.getTag(asset);
        const kind = tag.getKind();
        if (kind !== IdentifierKind.Asset) {
            return { why: "Invalid identifier kind. Expected a asset identifier." };
        }
        const hasUnsupportedFlags = (asset[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
}
/**
 * Generates an `Identifier` for a given asset.
 *
 * @param value - The value of the asset, which can be either a `Uint8Array` or a `Hex` string.
 * @returns An `Identifier` representing the asset.
 */
export const assetId = (value) => {
    return new AssetId(value);
};
/**
 * Checks if the given identifier is an instance of AssetId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of AssetId, otherwise false.
 */
export const isAssetId = (value) => {
    return value instanceof AssetId;
};
//# sourceMappingURL=asset-id.js.map