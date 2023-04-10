import { ABICoder, Schema } from "moi-abi";
import LogicDescriptor from "./descriptor";
import { InteractionResponse, JsonRpcProvider, Options } from "moi-providers";
import { LogicExecuteRequest, Routines } from "../types/logic";
import Errors from "./errors";
import { decodeBase64, LogicManifest } from "moi-utils";
import { Depolorizer } from "js-polo";

class Logic extends LogicDescriptor {
    private provider: JsonRpcProvider;
    public routines: Routines;

    constructor(logicId: string, provider: JsonRpcProvider, manifest: LogicManifest.Manifest) {
        super(logicId, manifest)
        this.provider = provider;
        this.createRoutines();
    }

    private createRoutines() {
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
        if (routineName.endsWith("!")) {
            return routineName.slice(0, -1); // Remove the last character (exclamation mark)
          }

          return routineName; // If no exclamation mark, return the original string
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

    private async processResult(response: any, ixObject: any, interactionHash: string, timeout?: number): Promise<any> {
        try {
            const result = await response.result(interactionHash, timeout);

            if(result) {
                const data = decodeBase64(result);
                const depolorizer = new Depolorizer(data);
    
                if(ixObject.routine.data && ixObject.routine.data.returns) {
                    const schema = Schema.parseFields(ixObject.routine.data.returns)
                    const result = depolorizer.depolorize(schema)
    
                    return result;
                }
            }
    
            return null;
        } catch(err) {
            throw err;
        }
    }

    private async executeRoutine(ixObject: any, ...args: any[]): Promise<InteractionResponse> {
        const processedArgs = this.processArguments(ixObject, args)

        if(!this.provider) {
            throw Errors.providerNotFound()
        }

        if(!this.logicId) {
            throw Errors.addressNotDefined()
        }

        switch(processedArgs.type) {
            case "call":
            case "estimate":
                throw new Error('Method "' + processedArgs.type + '" not implemented.');
            case "send":
                return this.provider.sendInteraction(processedArgs.params)
                .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, response, ixObject)
                    }
                }).catch((err) => {
                    throw err;
                });
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

    private createIxObject(routine: any, ...args: any[]): LogicExecuteRequest {
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

export const getLogicObject = async (logicId: string, provider: JsonRpcProvider, options?: Options) => {
    try {
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);

        if (typeof manifest === 'object') {
            return new Logic(logicId, provider, manifest);
        }

        throw new Error("Invalid manifest");
    } catch(err) {
        throw err;
    }
}
