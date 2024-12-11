import type { Address, Hex } from "js-moi-utils";
import type { IncludesLookup, MoiClientInfo } from "./shared";

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

interface RpcMethodLookup {
    "moi.Version": {
        params: [];
        response: MoiClientInfo;
    };

    "moi.Tesseract": {
        params: [reference: ClientTesseractReference, inputs: IncludesLookup["moi.Tesseract"][]];
        response: unknown;
    };
}

export type RpcMethod = keyof RpcMethodLookup;

export type RpcMethodParams<T> = T extends RpcMethod ? RpcMethodLookup[T]["params"] : unknown[];

export type RpcMethodResponse<T> = T extends RpcMethod ? RpcMethodLookup[T]["response"] : unknown;
