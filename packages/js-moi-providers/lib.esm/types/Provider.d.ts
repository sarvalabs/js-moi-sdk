import type { EventEmitter } from "events";
import type { Account, AccountAsset, AccountKey, Address, Asset, AssetId, ExtractModifier, Hex, IncludeModifier, Interaction, InteractionRequest, Logic, LogicId, LogicMessage, NetworkInfo, ResponseModifierParam, Simulate, StorageKey, Tesseract, TesseractReference, TesseractReferenceParam } from "js-moi-utils";
import type { InteractionResponse } from "../utils/interaction-response";
import type { MethodParams } from "./moi-execution-api";
export type NonOptionKeys<T extends Record<string, any>> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];
type NonUndefined<T> = T extends undefined ? never : T;
export type SelectFromResponseModifier<TObject extends Record<string, any>, TModifier extends ResponseModifierParam> = TModifier extends Required<ResponseModifierParam<infer K>> ? K extends keyof TObject ? TModifier extends {
    modifier: ExtractModifier<infer E>;
} ? NonUndefined<TObject[E]> : TModifier extends {
    modifier: IncludeModifier<infer E>;
} ? Required<Pick<TObject, E>> & Pick<TObject, NonOptionKeys<TObject>> : never : TObject : Pick<TObject, NonOptionKeys<TObject>>;
export type GetNetworkInfoOption = ResponseModifierParam<keyof NetworkInfo>;
/**
 * Structure for `moi.Protocol` to get network information.
 */
interface ProtocolRequest {
    /**
     * Get the version and chain ID of the network.
     *
     * @param option - Optional parameters for the request.
     */
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
}
export type SimulateOption = TesseractReferenceParam;
export type SimulateInteractionRequest = Omit<InteractionRequest, "fuel_limit">;
interface SimulateRequest {
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    simulate(ix: SimulateInteractionRequest, option?: SimulateOption): Promise<Simulate>;
}
export type AccountRequestOption = ResponseModifierParam<Exclude<keyof Account, "metadata">> & TesseractReferenceParam;
interface AccountRequest {
    getAccount<TOption extends AccountRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>>;
}
export type TesseractRequestOption = ResponseModifierParam<Exclude<keyof Tesseract, "hash" | "tesseract">>;
interface TesseractRequest {
    getTesseract<TOption extends TesseractRequestOption>(identifier: Address, height: number, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getTesseract<TOption extends TesseractRequestOption>(tesseract: Hex, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getTesseract<TOption extends TesseractRequestOption>(reference: TesseractReference, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
}
export type LogicRequestOption = TesseractReferenceParam & ResponseModifierParam<Exclude<keyof Logic, "metadata">>;
interface LogicRequest {
    getLogic<TOption extends LogicRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    getLogic<TOption extends LogicRequestOption>(logicId: LogicId, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
}
export type LogicStorageRequestOption = TesseractReferenceParam;
interface LogicStorageRequest {
    getLogicStorage(logicId: Hex | LogicId, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    getLogicStorage(logicId: Hex | LogicId, address: Address, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
}
export type AssetRequestOption = TesseractReferenceParam & ResponseModifierParam<Exclude<keyof Asset, "metadata">>;
interface AssetRequest {
    getAsset<TOption extends AssetRequestOption>(assetId: AssetId, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
    getAsset<TOption extends AssetRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
}
export type LogicMessageRequestOption = Omit<MethodParams<"moi.LogicMessage">[0], "logic_id">;
interface LogicMessageRequest {
    getLogicMessage(logicId: LogicId | Hex, options?: LogicMessageRequestOption): Promise<LogicMessage[]>;
}
export type AccountAssetRequestOption = ResponseModifierParam<Exclude<keyof AccountAsset, "balance">> & TesseractReferenceParam;
interface AccountAssetRequest {
    getAccountAsset<TOption extends AccountAssetRequestOption>(identifier: Address, assetId: Hex | AssetId, option?: TOption): Promise<SelectFromResponseModifier<AccountAsset, TOption>>;
}
export type AccountKeyRequestOption = Omit<MethodParams<"moi.AccountKey">[0], "identifier" | "key_idx">;
interface AccountKeyRequest {
    getAccountKey(identifier: Address, index: number, option?: AccountKeyRequestOption): Promise<AccountKey>;
}
export type ExecuteIx = MethodParams<"moi.Execute">[0];
export type Signature = ExecuteIx["signatures"][number];
interface ExecuteRequest {
    execute(ix: Uint8Array | Hex, signatures: Signature[]): Promise<InteractionResponse>;
    execute(ix: ExecuteIx): Promise<InteractionResponse>;
}
export type InteractionRequestOption = ResponseModifierParam<Exclude<keyof Interaction, "hash" | "status" | "interaction">>;
interface InteractionRequestMethod {
    getInteraction<TOption extends InteractionRequestOption>(hash: Hex, option?: TOption): Promise<SelectFromResponseModifier<Interaction, TOption>>;
}
interface SubscribeRequest {
    subscribe(event: string, params?: unknown): Promise<void>;
}
export interface Provider extends EventEmitter, AccountAssetRequest, AccountKeyRequest, AccountRequest, AssetRequest, ExecuteRequest, InteractionRequestMethod, LogicMessageRequest, LogicRequest, LogicStorageRequest, ProtocolRequest, SimulateRequest, SubscribeRequest, TesseractRequest {
}
export {};
//# sourceMappingURL=provider.d.ts.map