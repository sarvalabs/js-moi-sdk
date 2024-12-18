import type { Address, Hex } from "js-moi-utils";
export interface MoiClientInfo {
    /**
     * The networks protocol version
     */
    version: string;
    /**
     * The networks chain ID
     */
    chain_id: number;
}
/**
 * A list of strings indicating the properties to include in the response for provided methods.
 */
export interface IncludesLookup {
    "moi.Tesseract": "consensus" | "interactions" | "confirmations";
    "moi.Account": "keys" | "state" | "balances" | "mandates" | "deposits" | "logics" | "guardians" | "controlled" | "enlisted";
    "moi.AccountAsset": "balances" | "mandates" | "deposits";
}
export type IncludeFieldsFor<T extends keyof IncludesLookup> = IncludesLookup[T][];
export type TesseractIncludeFields = IncludeFieldsFor<"moi.Tesseract">;
export interface AbsoluteTesseractReference {
    /**
     * A 32-byte hash that is unique to the tesseract
     */
    absolute: Hex;
}
export interface RelativeTesseractOption {
    /**
     * A 32-byte address that describes an account that the tesseract is a part of.
     */
    address: Address;
    /**
     * The height of the tesseract on the given account.
     * The 0 & -1 values can be used be used to retrieve the oldest and
     * latest tesseracts for the account respectively
     */
    height: number;
}
export interface RelativeTesseractReference {
    relative: RelativeTesseractOption;
}
export type TesseractReference = {
    relative: RelativeTesseractOption;
    absolute?: undefined;
} | {
    absolute: Hex;
    relative?: undefined;
};
export interface TesseractReferenceParam {
    reference?: TesseractReference;
}
export interface IncludesParam<T extends keyof IncludesLookup> {
    /**
     * A list of strings indicating the properties to include in the response for provided method.
     */
    include?: IncludeFieldsFor<T>;
}
export interface InteractionParam {
    /**
     * The unique identifier of the interaction
     */
    hash: Hex;
}
export interface AccountParam {
    /**
     * The unique identifier of the account
     */
    address: Address;
}
export interface AssetParam {
    /**
     * The unique identifier of the asset
     */
    asset_id: Hex;
}
export interface LogicParam {
    /**
     * The unique identifier of the logic
     */
    logic_id: Hex;
}
export interface SignedInteraction {
    /**
     * POLO encoded interaction
     */
    interaction: Hex;
    /**
     * A list of signatures for the interaction
     */
    signatures: Hex[];
}
//# sourceMappingURL=shared.d.ts.map