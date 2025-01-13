import type {
    Account,
    Address,
    ExtractModifier,
    Hex,
    IncludeModifier,
    InteractionRequest,
    Logic,
    NetworkInfo,
    ResponseModifierParam,
    Simulate,
    Tesseract,
    TesseractReference,
    TesseractReferenceParam,
} from "js-moi-utils";
import type { EventEmitter } from "stream";

type NonOptionKeys<T extends Record<string, any>> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type SelectFromResponseModifier<TObject extends Record<string, any>, TModifier extends ResponseModifierParam> = TModifier extends Required<ResponseModifierParam<infer K>>
    ? K extends keyof TObject
        ? TModifier extends { modifier: ExtractModifier<infer E> }
            ? Required<Pick<TObject, E>>
            : TModifier extends { modifier: IncludeModifier<infer E> }
            ? Required<Pick<TObject, E>> & Pick<TObject, NonOptionKeys<TObject>>
            : never
        : TObject
    : Pick<TObject, NonOptionKeys<TObject>>;

export type GetNetworkInfoOption = ResponseModifierParam<keyof NetworkInfo>;

/**
 * Structure for `moi.Protocol` to get network information.
 */
interface ProtocolRequest {
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
}

export type SimulateOption = TesseractReferenceParam;

interface SimulateRequest {
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    simulate(ix: InteractionRequest, option?: SimulateOption): Promise<Simulate>;
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

export type LogicRequestOption = ResponseModifierParam<Exclude<keyof Logic, "metadata">>;

interface LogicRequest {
    getLogic<TOption extends LogicRequestOption>(identifier: Address, option?: LogicRequestOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
}

export interface Provider extends EventEmitter, ProtocolRequest, SimulateRequest, AccountRequest, TesseractRequest, LogicRequest {}
