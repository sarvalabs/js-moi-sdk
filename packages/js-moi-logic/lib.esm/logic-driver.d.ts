import type { SimulateInteractionRequest, TimerOption } from "js-moi-providers";
import type { SignerIx } from "js-moi-signer";
import { LogicId, LogicState, StorageKey, type Hex, type InteractionRequest } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { CallsiteOption, LogicCallsites, LogicDriverOption, StateAccessorFn } from "./types";
export declare class LogicDriver<TCallsites extends LogicCallsites = LogicCallsites> extends LogicDescriptor {
    private signer;
    readonly endpoint: TCallsites;
    private deployIxResponse?;
    constructor(option: Omit<LogicDriverOption, "logicId"> & {
        logicId?: LogicId;
    });
    private isDeployed;
    private getCallsiteType;
    isCallsiteMutable(callsite: string): boolean;
    private validateCallsiteOption;
    private extractArgsAndOption;
    private createIxOperation;
    createIxRequest(callsite: string, callsiteArguments: unknown[], option?: CallsiteOption): Promise<SignerIx<SimulateInteractionRequest> | SignerIx<InteractionRequest>>;
    getLogicId(timer?: TimerOption): Promise<LogicId>;
    private newCallsite;
    private setupEndpoint;
    private getLogicStorage;
    getStorageKey(state: LogicState, accessor: StateAccessorFn): StorageKey;
    private getLogicStateValue;
    persistent(accessor: StorageKey | Hex): Promise<Hex>;
    persistent<T>(accessor: StateAccessorFn): Promise<T>;
    ephemeral(accessor: StorageKey | Hex): Promise<Hex>;
    ephemeral<T>(accessor: StateAccessorFn): Promise<T>;
}
//# sourceMappingURL=logic-driver.d.ts.map