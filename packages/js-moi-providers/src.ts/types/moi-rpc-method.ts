import type { Hex } from "js-moi-utils";
import type { AccountParam, AssetParam, IncludesParam, InteractionParam, LogicParam, MoiClientInfo, TesseractReferenceParam } from "./shared";

interface RpcMethodLookup {
    "moi.Version": {
        params: [];
        response: MoiClientInfo;
    };
    "moi.Tesseract": {
        params: [Required<TesseractReferenceParam> & IncludesParam<"moi.Tesseract">];
        response: unknown;
    };
    "moi.Interaction": {
        params: [InteractionParam];
        response: { ix_data: unknown };
    };
    "moi.Account": {
        params: [AccountParam & TesseractReferenceParam & IncludesParam<"moi.Account">];
        response: { account_data: unknown };
    };
    "moi.AccountKey": {
        params: [AccountParam & { key_id: number; pending?: boolean }];
        response: { key_data: unknown };
    };
    "moi.AccountAsset": {
        params: [AccountParam & AssetParam & TesseractReferenceParam & IncludesParam<"moi.AccountAsset">];
        response: { asset_data: unknown };
    };
    "moi.Asset": {
        params: [AssetParam & TesseractReferenceParam];
        response: { asset_data: unknown };
    };
    "moi.Logic": {
        params: [LogicParam & TesseractReferenceParam];
        response: { logic_data: unknown };
    };
    "moi.LogicStorage": {
        params: [LogicParam & Partial<AccountParam> & TesseractReferenceParam & { storage_key: Hex }];
        response: Hex;
    };
}

export type RpcMethod = keyof RpcMethodLookup;

export type RpcMethodParams<T> = T extends RpcMethod ? RpcMethodLookup[T]["params"] : unknown[];

export type RpcMethodResponse<T> = T extends RpcMethod ? RpcMethodLookup[T]["response"] : unknown;
