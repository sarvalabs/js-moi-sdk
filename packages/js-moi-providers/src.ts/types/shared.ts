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

export type ClientTesseractReference = RelativeTesseractReference | AbsoluteTesseractReference;

export interface ClientTesseractReferenceParam {
    reference?: ClientTesseractReference;
}

export interface IncludesParam<T extends keyof IncludesLookup> {
    include?: IncludesLookup[T][];
}

export interface InteractionParam {
    hash: Hex;
}

export interface AccountParam {
    address: Address;
}

export interface AssetParam {
    asset_id: Hex;
}
