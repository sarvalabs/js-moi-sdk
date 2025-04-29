import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import { Identifier } from "./identifier";
import { hexToBytes } from "./utils";
export class AssetId extends Identifier {
    constructor(value) {
        super(value);
        const error = AssetId.validate(this.toBytes());
        if (error) {
            throw new TypeError(`Invalid asset identifier. ${error.why}`);
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
        if (!(value instanceof Uint8Array || typeof value === "string")) {
            return { why: "Invalid type of value, expected bytes or hex string." };
        }
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
    static isValid(value) {
        try {
            return this.validate(value) === null;
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=asset-id.js.map