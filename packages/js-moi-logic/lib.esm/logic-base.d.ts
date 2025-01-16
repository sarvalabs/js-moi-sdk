import { type LogicId } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { LogicCallsites, LogicDriverOption } from "./types";
export declare class LogicBase<TCallsites extends LogicCallsites = LogicCallsites> extends LogicDescriptor {
    private signer;
    readonly endpoint: TCallsites;
    constructor(option: Omit<LogicDriverOption, "logicId"> & {
        logicId?: LogicId;
    });
    private isDeployed;
    private getCallsiteType;
    isCallsiteMutable(callsite: string): boolean;
    private newCallsite;
    private setupEndpoint;
}
//# sourceMappingURL=logic-base.d.ts.map