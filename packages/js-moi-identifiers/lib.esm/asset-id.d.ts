import { type AssetStandard, type Hex } from "js-moi-utils";
import { type Flag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierTag } from "./identifier-tag";
export declare class AssetId {
    private readonly buff;
    constructor(value: Uint8Array);
    toBytes(): Uint8Array;
    toHex(): Hex;
    toIdentifier(): Identifier;
    getTag(): IdentifierTag;
    getFingerprint(): Uint8Array;
    getVariant(): number;
    getStandard(): AssetStandard;
    getFlag(flag: Flag): boolean;
    isVariant(): boolean;
    static validate(asset: AssetId): Error | null;
    static fromHex(value: Hex): AssetId;
}
//# sourceMappingURL=asset-id.d.ts.map