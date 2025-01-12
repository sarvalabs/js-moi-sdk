import type { NetworkInfo, ResponseModifierParam } from "js-moi-utils";
/**
 * Structure for `moi.Protocol` to get network information.
 */
interface GetNetworkInfoRequest {
    getNetworkInfo(option: ResponseModifierParam<keyof NetworkInfo>): NetworkInfo;
}
export interface ProviderMethods extends GetNetworkInfoRequest {
}
export {};
//# sourceMappingURL=IProvider.d.ts.map