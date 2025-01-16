"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_providers_1 = require("js-moi-providers");
const js_moi_utils_1 = require("js-moi-utils");
const logic_descriptor_1 = require("./logic-descriptor");
class LogicBase extends logic_descriptor_1.LogicDescriptor {
    signer;
    endpoint;
    constructor(option) {
        super(option.manifest, option.logicId);
        this.signer = option.signer;
        this.endpoint = this.setupEndpoint();
    }
    isDeployed() {
        return this.logicId != null;
    }
    getCallsiteType(callsite) {
        return this.getRoutineElement(callsite).data.kind;
    }
    isCallsiteMutable(callsite) {
        const kinds = [js_moi_utils_1.LogicState.Ephemeral, js_moi_utils_1.LogicState.Persistent];
        const element = this.getRoutineElement(callsite);
        return kinds.includes(element.data.mode);
    }
    newCallsite(callsite) {
        const callback = async (...args) => {
            if (this.isDeployed()) {
                js_moi_utils_1.ErrorUtils.throwError(`Logic is already deployed with logic id "${this.getLogicId().value}".`);
            }
            if (this.isCallsiteMutable(callsite)) {
                return new js_moi_providers_1.InteractionResponse("0x", this.signer?.getProvider());
            }
            return null;
        };
        return callback;
    }
    setupEndpoint() {
        const endpoint = {};
        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);
            if (element.kind !== js_moi_utils_1.ElementType.Routine) {
                js_moi_utils_1.ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }
            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }
        return Object.freeze(endpoint);
    }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map