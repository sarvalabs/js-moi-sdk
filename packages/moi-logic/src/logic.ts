import ABICoder from "moi-abi";
import LogicManifest from "moi-abi/types/manifest";
import LogicDescriptor from "./descriptor";
import { JsonRpcProvider } from "moi-providers";
import { LogicExecuteRequest, Routines } from "../types/logic";
import Errors from "./errors";

export class Logic extends LogicDescriptor {
    private provider: JsonRpcProvider;
    public routines: Routines;

    constructor(logicId: string, provider: JsonRpcProvider, manifest?: LogicManifest.Manifest) {
        super(logicId, manifest)
        this.provider = provider;
        this.routines = {};

        this.manifest.elements.forEach(element => {
            element.data = element.data as LogicManifest.Routine
            if(element.kind === "routine" && element.data.kind !== "deployer") {
                const routineName = this.normalizeRoutineName(element.data.name)
                this.routines[routineName] = (args: any[]) => {
                    return this.createIxObject(element, ...args)
                }
            }
        })
    }

    private normalizeRoutineName(routineName: string) {
        return routineName.replace("!", "")
    }

    private createPayload(ixObject: any): any {
        const payload: any = {
            logic_id: this.logicId,
            callsite: ixObject.routine.data.name,
        }

        if(ixObject.routine.data.accepts && Object.keys(ixObject.routine.data.accepts).length > 0) {
            payload.calldata = ABICoder.encodeArguments(ixObject.routine.data.accepts, ixObject.arguments);
        }

        return payload;
    }

    private processArguments(ixObject: any, args: any[]): any {
        if(args.length < 2 || !args[1].sender) {
            throw Errors.missingArguments()
        }

        const processedArgs: any = {
            type: args[0],
            params: {
                sender: args[1].sender
            }
        }

        if(args[0] === "send") {
            if(!args[1].fuelPrice || !args[1].fuelLimit) {
                throw Errors.missingFuelInfo()
            }

            processedArgs.params.type = 8;
            processedArgs.params.fuel_price = args[1].fuelPrice;
            processedArgs.params.fuel_limit = args[1].fuelLimit;
        }

        processedArgs.params.payload = ixObject.createPayload();

        return processedArgs
    }

    private executeRoutine(ixObject: any, ...args: any[]): any {
        const processedArgs = this.processArguments(ixObject, args)

        if(!this.provider) {
            throw Errors.providerNotFound()
        }

        if(!this.logicId) {
            throw Errors.addressNotDefined()
        }

        switch(processedArgs.type) {
            case "estimate":
                console.log("yet to be implemented");
                break;
            case "call":
                console.log("yet to be implemented")
                break;
            case "send":
                return this.provider.sendInteraction(processedArgs.params)
            default:
                throw new Error('Method "' + processedArgs.type + '" not implemented.');
        }
    }

    private createIxRequest(ixObject: any): LogicExecuteRequest {
        return {
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateGas: ixObject.estimateGas.bind(ixObject)
        }
    }

    private createIxObject(routine: any, ...args: any[]) {
        const ixObject:any = {
            routine: routine,
            arguments: args
        }

        ixObject.call = (...args: any[]) => {
            return this.executeRoutine(ixObject, "call", ...args)
        }

        ixObject.send = (...args: any[]) => {
            return this.executeRoutine(ixObject, "send", ...args)
        }

        ixObject.estimateGas = (...args: any[]) => {
            return this.executeRoutine(ixObject, "estimateGas", ...args)
        }

        ixObject.createPayload = () => {
            return this.createPayload(ixObject)
        }

        return this.createIxRequest(ixObject)
    }
}
