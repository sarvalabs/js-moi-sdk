import type { ExtractModifier, IncludeModifier, NetworkInfo, ResponseModifierParam } from "js-moi-utils";
export type SelectFromResponseModifier<TObject extends Record<string, any>, TModifier extends ResponseModifierParam> = TModifier extends ResponseModifierParam<infer K> ? K extends keyof TObject ? TModifier extends {
    modifier: ExtractModifier<infer E>;
} ? TObject[E] : TModifier extends {
    modifier: IncludeModifier<infer E>;
} ? Pick<TObject, E> : TObject : TObject : TObject;
export type GetNetworkInfoOption = ResponseModifierParam<keyof NetworkInfo>;
/**
 * Structure for `moi.Protocol` to get network information.
 */
export interface GetNetworkInfoRequest {
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
}
export interface IProviderActions extends GetNetworkInfoRequest {
}
//# sourceMappingURL=Provider.d.ts.map