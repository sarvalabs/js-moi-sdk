import type { Signer } from "js-moi-signer";
import type { LogicId, LogicManifest } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
interface LogicBaseOptions {
    signer?: Signer;
    logicId?: LogicId;
    manifest: LogicManifest;
}
export declare class LogicBase extends LogicDescriptor {
    private signer?;
    constructor(option: LogicBaseOptions);
    private createOperation;
}
export {};
//# sourceMappingURL=logic-base.d.ts.map