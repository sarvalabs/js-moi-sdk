import { type AssetStandard, type Hex } from "js-moi-utils";
import { BaseIdentifier } from "./base-identifier";
import type { Identifier, InvalidReason } from "./types/identifier";
export declare class AssetId extends BaseIdentifier {
    constructor(value: Uint8Array | Hex);
    /**
     * Retrieves the standard of the asset.
     *
     * This method extracts a 16-bit unsigned integer from the byte representation
     * of the asset, starting from the 3rd byte (index 2) to the 4th byte (index 3).
     * The extracted value represents the asset standard.
     *
     * @returns {AssetStandard} The standard of the asset as a 16-bit unsigned integer.
     */
    getStandard(): AssetStandard;
    static validate(value: Uint8Array | Hex): InvalidReason | null;
}
/**
 * Generates an `Identifier` for a given asset.
 *
 * @param value - The value of the asset, which can be either a `Uint8Array` or a `Hex` string.
 * @returns An `Identifier` representing the asset.
 */
export declare const assetId: (value: Uint8Array | Hex) => Identifier;
/**
 * Checks if the given identifier is an instance of AssetId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of AssetId, otherwise false.
 */
export declare const isAssetId: (value: Identifier) => value is AssetId;
//# sourceMappingURL=asset-id.d.ts.map