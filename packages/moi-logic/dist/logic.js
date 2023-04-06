"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logic = void 0;
const moi_abi_1 = require("moi-abi");
const descriptor_1 = __importDefault(require("./descriptor"));
const errors_1 = __importDefault(require("./errors"));
class Logic extends descriptor_1.default {
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
            payload.calldata = moi_abi_1.ABICoder.encodeArguments(ixObject.routine.data.accepts, ixObject.arguments);
        }
        return payload;
    }
    processArguments(ixObject, args) {
        if (args.length < 2 || !args[1].sender) {
            throw errors_1.default.missingArguments();
        }
        const processedArgs = {
            type: args[0],
            params: {
                sender: args[1].sender
            }
        };
        if (args[0] === "send") {
            if (!args[1].fuelPrice || !args[1].fuelLimit) {
                throw errors_1.default.missingFuelInfo();
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
            throw errors_1.default.providerNotFound();
        }
        if (!this.logicId) {
            throw errors_1.default.addressNotDefined();
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
exports.Logic = Logic;
