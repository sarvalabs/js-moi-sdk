"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = void 0;
const moi_abi_1 = require("moi-abi");
const state_1 = require("./state");
const descriptor_1 = __importDefault(require("./descriptor"));
const errors_1 = __importDefault(require("./errors"));
class LogicDriver extends descriptor_1.default {
    provider;
    abiCoder;
    routines;
    persistentState;
    ephemeralState;
    constructor(logicId, manifest, provider) {
        super(logicId, manifest);
        this.provider = provider;
        this.abiCoder = new moi_abi_1.ABICoder(this.elements, this.classDefs);
        this.createState();
        this.createRoutines();
    }
    createState() {
        const [persistentStatePtr, persistentStateExists] = this.hasPersistentState();
        if (persistentStateExists) {
            this.persistentState = new state_1.PersistentState(this.logicId.hex(), this.elements.get(persistentStatePtr), this.abiCoder, this.provider);
        }
    }
    createRoutines() {
        this.routines = {};
        this.manifest.elements.forEach(element => {
            element.data = element.data;
            if (element.kind === "routine" && element.data.kind === "invokable") {
                const routineName = this.normalizeRoutineName(element.data.name);
                this.routines[routineName] = (args = []) => {
                    return this.createIxObject(element, ...args);
                };
            }
        });
    }
    isMutableRoutine(routineName) {
        return routineName.endsWith("!");
    }
    normalizeRoutineName(routineName) {
        if (this.isMutableRoutine(routineName)) {
            return routineName.slice(0, -1); // Remove the last character (exclamation mark)
        }
        return routineName; // If no exclamation mark, return the original string
    }
    createPayload(ixObject) {
        const payload = {
            logic_id: this.getLogicId(),
            callsite: ixObject.routine.data.name,
        };
        if (ixObject.routine.data.accepts &&
            Object.keys(ixObject.routine.data.accepts).length > 0) {
            payload.calldata = this.abiCoder.encodeArguments(ixObject.routine.data.accepts, ixObject.arguments);
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
    async processResult(response, ixObject, interactionHash, timeout) {
        try {
            const result = await response.result(interactionHash, timeout);
            const data = { output: null, error: null };
            if (result.error && result.error !== "0x") {
                data.error = moi_abi_1.ABICoder.decodeException(result.error);
            }
            if (!this.isMutableRoutine(ixObject.routine.data.name) &&
                (result.outputs && result.outputs !== "0x") &&
                ixObject.routine.data && ixObject.routine.data.returns) {
                data.output = this.abiCoder.decodeOutput(result.outputs, ixObject.routine.data.returns);
            }
            if (data.output || data.error) {
                return data;
            }
            return null;
        }
        catch (err) {
            throw err;
        }
    }
    async executeRoutine(ixObject, ...args) {
        const processedArgs = this.processArguments(ixObject, args);
        if (!this.provider) {
            throw errors_1.default.providerNotFound();
        }
        if (!this.getLogicId()) {
            throw errors_1.default.addressNotDefined();
        }
        switch (processedArgs.type) {
            case "call":
            case "estimate":
                throw new Error('Method "' + processedArgs.type + '" not implemented.');
            case "send":
                return this.provider.sendInteraction(processedArgs.params)
                    .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, response, ixObject)
                    };
                }).catch((err) => {
                    throw err;
                });
            default:
                throw new Error('Method "' + processedArgs.type + '" not supported.');
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
const getLogicDriver = async (logicId, provider, options) => {
    try {
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);
        if (typeof manifest === 'object') {
            return new LogicDriver(logicId, manifest, provider);
        }
        throw new Error("Invalid manifest");
    }
    catch (err) {
        throw err;
    }
};
exports.getLogicDriver = getLogicDriver;
