import { ABICoder } from "moi-abi";
import LogicDescriptor from "./descriptor";
import Errors from "./errors";
export class Logic extends LogicDescriptor {
    provider;
    routines;
    constructor(logicId, provider, manifest) {
        super(logicId, manifest);
        this.provider = provider;
        this.routines = {};
        this.manifest.elements.forEach(element => {
            element.data = element.data;
            if (element.kind === "routine" && element.data.kind !== "deployer") {
                const routineName = this.normalizeRoutineName(element.data.name);
                this.routines[routineName] = (args) => {
                    return this.createIxObject(element, ...args);
                };
            }
        });
    }
    normalizeRoutineName(routineName) {
        return routineName.replace("!", "");
    }
    createPayload(ixObject) {
        const payload = {
            logic_id: this.logicId,
            callsite: ixObject.routine.data.name,
        };
        if (ixObject.routine.data.accepts && Object.keys(ixObject.routine.data.accepts).length > 0) {
            payload.calldata = ABICoder.encodeArguments(ixObject.routine.data.accepts, ixObject.arguments);
        }
        return payload;
    }
    processArguments(ixObject, args) {
        if (args.length < 2 || !args[1].sender) {
            throw Errors.missingArguments();
        }
        const processedArgs = {
            type: args[0],
            params: {
                sender: args[1].sender
            }
        };
        if (args[0] === "send") {
            if (!args[1].fuelPrice || !args[1].fuelLimit) {
                throw Errors.missingFuelInfo();
            }
            processedArgs.params.type = 8;
            processedArgs.params.fuel_price = args[1].fuelPrice;
            processedArgs.params.fuel_limit = args[1].fuelLimit;
        }
        processedArgs.params.payload = ixObject.createPayload();
        return processedArgs;
    }
    executeRoutine(ixObject, ...args) {
        const processedArgs = this.processArguments(ixObject, args);
        if (!this.provider) {
            throw Errors.providerNotFound();
        }
        if (!this.logicId) {
            throw Errors.addressNotDefined();
        }
        switch (processedArgs.type) {
            case "estimate":
                console.log("yet to be implemented");
                break;
            case "call":
                console.log("yet to be implemented");
                break;
            case "send":
                return this.provider.sendInteraction(processedArgs.params);
            default:
                throw new Error('Method "' + processedArgs.type + '" not implemented.');
        }
    }
    createIxRequest(ixObject) {
        return {
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateGas: ixObject.estimateGas.bind(ixObject)
        };
    }
    createIxObject(routine, ...args) {
        const ixObject = {
            routine: routine,
            arguments: args
        };
        ixObject.call = (...args) => {
            return this.executeRoutine(ixObject, "call", ...args);
        };
        ixObject.send = (...args) => {
            return this.executeRoutine(ixObject, "send", ...args);
        };
        ixObject.estimateGas = (...args) => {
            return this.executeRoutine(ixObject, "estimateGas", ...args);
        };
        ixObject.createPayload = () => {
            return this.createPayload(ixObject);
        };
        return this.createIxRequest(ixObject);
    }
}
