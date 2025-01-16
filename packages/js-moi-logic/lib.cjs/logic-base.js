"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const logic_descriptor_1 = require("./logic-descriptor");
class LogicBase extends logic_descriptor_1.LogicDescriptor {
    signer;
    constructor(option) {
        super(option.manifest, option.logicId);
        this.signer = option.signer;
    }
    createOperation(element) { }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map