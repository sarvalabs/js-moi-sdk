"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicFactory = void 0;
const moi_abi_1 = require("moi-abi");
const errors_1 = __importDefault(require("./errors"));
const errors_2 = __importDefault(require("./errors"));
class LogicFactory {
    manifest;
    encodedManifest;
    provider;
    constructor(manifest, provider) {
        this.manifest = manifest;
        this.encodedManifest = moi_abi_1.ABICoder.encodeABI(manifest);
        this.provider = provider;
    }
    createPayload(ixObject) {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.data.name
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
            processedArgs.params.type = 7;
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
    createIxObject(routine, ...args) {
        const ixObject = {
            routine: routine,
            arguments: args
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
        return ixObject;
    }
    createIxRequest(ixObject) {
        return {
            send: ixObject.send.bind(ixObject),
            estimateGas: ixObject.estimateGas.bind(ixObject)
        };
    }
    deploy(options, callback) {
        const builder = Object.values(this.manifest.elements)
            .find(element => {
            if (element.kind === "routine") {
                element.data = element.data;
                return element.data.kind === "deployer" &&
                    options.builderName === element.data.name;
            }
            return false;
        });
        if (builder) {
            builder.data = builder.data;
            if (builder.data.accepts && Object.keys(builder.data.accepts).length != options.arguments.length) {
                callback(errors_2.default.missingArguments());
            }
            const ixObject = this.createIxObject(builder, ...options.arguments);
            return this.createIxRequest(ixObject);
        }
        callback(errors_2.default.builderNotFound());
        throw errors_2.default.builderNotFound();
    }
}
exports.LogicFactory = LogicFactory;
