import type { Hex } from "js-moi-utils";
import type { AccountParam, AssetParam, IncludesParam, InteractionParam, LogicParam, MoiClientInfo, TesseractReferenceParam } from "./shared";

interface MOIExecutionApi {
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
    "moi.LogicEvents": {
        params: [];
        response: unknown;
    };
    "moi.SyncStatus": {
        params: [{ include_pending_accounts?: boolean }];
        response: unknown;
    };
    "moi.Subscribe": {
        params: unknown[];
        response: string;
    };
    "moi.Subscription": {
        params: [];
        response: unknown;
    };
    "moi.Unsubscribe": {
        params: [];
        response: unknown;
    };
}

export type RpcMethod = keyof MOIExecutionApi;

export type RpcMethodParams<T> = T extends RpcMethod ? MOIExecutionApi[T]["params"] : unknown[];

export type RpcMethodResponse<T> = T extends RpcMethod ? MOIExecutionApi[T]["response"] : unknown;
