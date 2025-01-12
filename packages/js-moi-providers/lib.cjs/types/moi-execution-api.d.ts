import type { NetworkInfo, ResponseModifierParam } from "js-moi-utils";
export type ApiMethod<TParams extends any[], TResponse> = {
    params: TParams;
    response: TResponse;
};
export interface NetworkActionApi {
    "moi.Protocol": ApiMethod<[option?: ResponseModifierParam<keyof NetworkInfo>], any>;
}
export type NetworkMethod = keyof NetworkActionApi;
export type MethodParams<T extends NetworkMethod> = NetworkMethod extends T ? NetworkActionApi[T]["params"] : any[];
export type MethodResponse<T extends string> = T extends NetworkMethod ? NetworkActionApi[T]["response"] : any;
//# sourceMappingURL=moi-execution-api.d.ts.map