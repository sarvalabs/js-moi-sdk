import { InteractionResponse } from "js-moi-providers";
import { ElementType, ErrorUtils, LogicState } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
export class LogicBase extends LogicDescriptor {
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
        const kinds = [LogicState.Ephemeral, LogicState.Persistent];
        const element = this.getRoutineElement(callsite);
        return kinds.includes(element.data.mode);
    }
    newCallsite(callsite) {
        const callback = async (...args) => {
            if (this.isDeployed()) {
                ErrorUtils.throwError(`Logic is already deployed with logic id "${this.getLogicId().value}".`);
            }
            if (this.isCallsiteMutable(callsite)) {
                return new InteractionResponse("0x", this.signer?.getProvider());
            }
            return null;
        };
        return callback;
    }
    setupEndpoint() {
        const endpoint = {};
        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);
            if (element.kind !== ElementType.Routine) {
                ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }
            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }
        return Object.freeze(endpoint);
    }
}
//# sourceMappingURL=logic-base.js.map