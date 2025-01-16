import { LogicDescriptor } from "./logic-descriptor";
export class LogicBase extends LogicDescriptor {
    signer;
    constructor(option) {
        super(option.manifest, option.logicId);
        this.signer = option.signer;
    }
    createOperation(element) { }
}
//# sourceMappingURL=logic-base.js.map