import { InteractionResponse } from "js-moi-providers";
import type { Signer } from "js-moi-signer";
import { ElementType, ErrorUtils, LogicState, type LogicId } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { CallsiteCallback, LogicCallsites, LogicDriverOption } from "./types";

export class LogicBase<TCallsites extends LogicCallsites = LogicCallsites> extends LogicDescriptor {
    private signer: Signer;

    public readonly endpoint: TCallsites;

    constructor(option: Omit<LogicDriverOption, "logicId"> & { logicId?: LogicId }) {
        super(option.manifest, option.logicId);

        this.signer = option.signer;
        this.endpoint = this.setupEndpoint();
    }

    private isDeployed() {
        return this.logicId != null;
    }

    private getCallsiteType(callsite: string) {
        return this.getRoutineElement(callsite).data.kind;
    }

    public isCallsiteMutable(callsite: string) {
        const kinds = [LogicState.Ephemeral, LogicState.Persistent];
        const element = this.getRoutineElement(callsite);

        return kinds.includes(element.data.mode);
    }

    private newCallsite(callsite: string) {
        const callback: CallsiteCallback = async (...args: unknown[]) => {
            if (this.isDeployed()) {
                ErrorUtils.throwError(`Logic is already deployed with logic id "${this.getLogicId().value}".`);
            }

            if (this.isCallsiteMutable(callsite)) {
                return new InteractionResponse("0x", this.signer?.getProvider());
            }

            return null!;
        };

        return callback;
    }

    private setupEndpoint() {
        const endpoint = {};

        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);

            if (element.kind !== ElementType.Routine) {
                ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }

            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }

        return Object.freeze(endpoint as TCallsites);
    }
}
