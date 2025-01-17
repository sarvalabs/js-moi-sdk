import type { SimulateInteractionRequest, TimerOption } from "js-moi-providers";
import type { SignerIx } from "js-moi-signer";
import { LogicId, type InteractionRequest } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { CallsiteOption, LogicCallsites, LogicDriverOption, StateAccessorFn } from "./types";
export declare class LogicBase<TCallsites extends LogicCallsites = LogicCallsites> extends LogicDescriptor {
    private signer;
    readonly endpoint: TCallsites;
    private deployIxResponse?;
    constructor(option: Omit<LogicDriverOption, "logicId"> & {
        logicId?: LogicId;
    });
    private isDeployed;
    private getCallsiteType;
    isCallsiteMutable(callsite: string): boolean;
    validateCallsiteOption(option?: CallsiteOption): Error | null;
    private extractArgsAndOption;
    private createIxOperation;
    createIxRequest(callsite: string, callsiteArguments: unknown[], option?: CallsiteOption): Promise<SignerIx<SimulateInteractionRequest> | SignerIx<InteractionRequest>>;
    getLogicId(timer?: TimerOption): Promise<LogicId>;
    private newCallsite;
    private setupEndpoint;
    persistent(accessor: StateAccessorFn): void;
}
//# sourceMappingURL=logic-base.d.ts.map