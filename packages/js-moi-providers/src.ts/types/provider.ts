import type {
    Account,
    Address,
    ExtractModifier,
    Hex,
    IncludeModifier,
    InteractionRequest,
    NetworkInfo,
    ResponseModifierParam,
    Simulate,
    TesseractReferenceParam,
} from "js-moi-utils";
import type { EventEmitter } from "stream";

type NonOptionKeys<T extends Record<string, any>> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type SelectFromResponseModifier<TObject extends Record<string, any>, TModifier extends ResponseModifierParam> = TModifier extends Required<ResponseModifierParam<infer K>>
    ? K extends keyof TObject
        ? TModifier extends { modifier: ExtractModifier<infer E> }
            ? TObject[E]
            : TModifier extends { modifier: IncludeModifier<infer E> }
            ? Required<Pick<TObject, E>> & Pick<TObject, NonOptionKeys<TObject>>
            : never
        : TObject
    : Pick<TObject, NonOptionKeys<TObject>>;

export type GetNetworkInfoOption = ResponseModifierParam<keyof NetworkInfo>;

/**
 * Structure for `moi.Protocol` to get network information.
 */
interface GetNetworkInfoRequest {
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
}

export type SimulateOption = TesseractReferenceParam;

interface SimulateRequest {
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    simulate(ix: InteractionRequest, option?: SimulateOption): Promise<Simulate>;
}

export type AccountRequestOption = ResponseModifierParam<Exclude<keyof Account, "metadata">>;

interface AccountRequest {
    getAccount<TOption extends AccountRequestOption>(address: Address, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>>;
}

export interface Provider extends EventEmitter, GetNetworkInfoRequest, SimulateRequest, AccountRequest {}
