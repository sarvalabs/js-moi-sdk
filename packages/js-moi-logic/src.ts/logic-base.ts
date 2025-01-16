import type { Signer } from "js-moi-signer";
import type { Element, ElementType, LogicId, LogicManifest } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";

interface LogicBaseOptions {
    signer?: Signer;
    logicId?: LogicId;
    manifest: LogicManifest;
}

export class LogicBase extends LogicDescriptor {
    private signer?: Signer;

    constructor(option: LogicBaseOptions) {
        super(option.manifest, option.logicId);
        this.signer = option.signer;
    }

    private createOperation(element: Element<ElementType.Routine>) {}
}
