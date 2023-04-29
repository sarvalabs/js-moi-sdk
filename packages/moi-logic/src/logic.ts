import { ABICoder } from "moi-abi";
import { LogicManifest } from "moi-utils";
import { InteractionResponse, JsonRpcProvider, Options } from "moi-providers";
import { LogicExecuteRequest, Routines } from "../types/logic";
import { EphemeralState, PersistentState } from "./state";
import LogicDescriptor from "./descriptor";
import Errors from "./errors";

class LogicDriver extends LogicDescriptor {
    private provider: JsonRpcProvider;
    private abiCoder: ABICoder;
    public routines: Routines;
    public persistentState: PersistentState;
    public ephemeralState: EphemeralState;

    constructor(logicId: string, manifest: LogicManifest.Manifest, provider: JsonRpcProvider) {
        super(logicId, manifest)
        this.provider = provider;
        this.abiCoder = new ABICoder(this.elements, this.classDefs);
        this.createState();
        this.createRoutines();
    }

    private createState() {
        const [persistentStatePtr, persistentStateExists] = this.hasPersistentState()

        if(persistentStateExists) {
            this.persistentState = new PersistentState(
                this.logicId.hex(),
                this.elements.get(persistentStatePtr),
                this.abiCoder,
                this.provider
            )
        }
    }

    private createRoutines() {
        this.routines = {};
        this.manifest.elements.forEach(element => {
            element.data = element.data as LogicManifest.Routine
            if(element.kind === "routine" && element.data.kind === "invokable") {
                const routineName = this.normalizeRoutineName(element.data.name)
                this.routines[routineName] = (args: any[] = []) => {
                    return this.createIxObject(element, ...args)
                }
            }
        })
    }

    private isMutableRoutine(routineName: string) {
        return routineName.endsWith("!");
    }

    private normalizeRoutineName(routineName: string) {
        if (this.isMutableRoutine(routineName)) {
            return routineName.slice(0, -1); // Remove the last character (exclamation mark)
        }

        return routineName; // If no exclamation mark, return the original string
    }

    private createPayload(ixObject: any): any {
        const payload: any = {
            logic_id: this.getLogicId(),
            callsite: ixObject.routine.data.name,
        }

        if(ixObject.routine.data.accepts && 
        Object.keys(ixObject.routine.data.accepts).length > 0) {
            payload.calldata = this.abiCoder.encodeArguments(
                ixObject.routine.data.accepts, 
                ixObject.arguments
            );
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
            const data = { output: null, error: null };

            if(result.error && result.error !== "0x") {
                data.error = ABICoder.decodeException(result.error)
            }

            if(!this.isMutableRoutine(ixObject.routine.data.name) && 
            (result.outputs && result.outputs !== "0x") && 
            ixObject.routine.data && ixObject.routine.data.returns) {
                data.output = this.abiCoder.decodeOutput(
                    result.outputs,
                    ixObject.routine.data.returns
                )
            }
    
            if(data.output || data.error) {
                return data
            }

            return null
        } catch(err) {
            throw err;
        }
    }

    private async executeRoutine(ixObject: any, ...args: any[]): Promise<InteractionResponse> {
        const processedArgs = this.processArguments(ixObject, args)

        if(!this.provider) {
            throw Errors.providerNotFound()
        }

        if(!this.getLogicId()) {
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
                throw new Error('Method "' + processedArgs.type + '" not supported.');
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

export const getLogicDriver = async (logicId: string, provider: JsonRpcProvider, options?: Options): Promise<LogicDriver> => {
    try {
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);

        if (typeof manifest === 'object') {
            return new LogicDriver(logicId, manifest, provider);
        }

        throw new Error("Invalid manifest");
    } catch(err) {
        throw err;
    }
}
