import ABICoder from "moi-abi";
import Method from "moi-core-method";
import RequestManager from "moi-core-request-manager";
import LogicManifest from "moi-abi/types/manifest";
import Errors from "./errors";
import LogicErrors from "./errors";

export default class Logic {
    public logicId: string;
    public logicManifest: LogicManifest.Manifest;
    public encodedManifest: string;
    public routines: object;
    public provider: string;

    constructor(manifest: LogicManifest.Manifest, logicId?: string) {
        this.logicId = logicId ? logicId : null;
        this.logicManifest = manifest;
        this.encodedManifest = ABICoder.encodeABI(manifest)
        this.routines = {}
        Object.values(manifest.elements).forEach(element => {
            if(element.kind === "routine") {
                const routineName = this.normalizeRoutineName(element.data.name)
                this.routines[routineName] = (...args: any[]) => {
                    return this.createIxObject(element, ...args)
                }
            }
        });
    }

    private normalizeRoutineName(routineName: string) {
        return routineName.replace("!", "")
    }

    private encodeRoutine(ixObject: any): any {
        const payload: any = {}
        if(ixObject.routine.kind == "builder") {
            payload.is_stateful = true;
            payload.is_interactive = true;
            payload.manifest = this.encodedManifest;
        } else {
            payload.callsite = ixObject.routine.data.name
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

            if(ixObject.routine.kind === "builder") {
                processedArgs.params.type = 7;
            } else {
                processedArgs.params.type = 8;
            }

            processedArgs.params.fuel_price = args[1].fuelPrice;
            processedArgs.params.fuel_limit = args[1].fuelLimit;
        }

        processedArgs.params.payload = ixObject.encodeRoutine();

        return processedArgs
    }

    private executeRoutine(ixObject: any, ...args: any[]): any {
        const processedArgs = this.processArguments(ixObject, args)

        if(!this.provider) {
            throw Errors.providerNotFound()
        }

        if(ixObject.type === 8 && !this.logicId) {
            throw Errors.addressNotDefined()
        }

        const requestManager = new RequestManager(this.provider)

        switch(processedArgs.type) {
            case "estimate":
                console.log("yet to be implemented");
                break;
            case "call":
                console.log("yet to be implemented")
                break;
            case "send":
                // const result = requestManger.send({
                //     method: "moi.SendInteractions",
                //     params: [{
                //         type: ixObject.type,
                //         fuel_price: processedArgs.fuelPrice,
                //         fuel_limit: processedArgs.fuelLimit,
                //         sender: processedArgs.sender,
                //         payload: ixObject.payload
                //     }],
                //     jsonrpc: "2.0",
                //     id: 1
                // })
                                
                // return result
                const sendInteractions = new Method({
                    name: "SendInteractions",
                    call: "moi.SendInteractions",
                    noOfParams: 1,
                    requestManager: requestManager
                }).createFunction()

                return sendInteractions(processedArgs.params)
            default:
                throw new Error('Method "' + processedArgs.type + '" not implemented.');
        }
    }

    private createIxObject(routine: any, ...args: any[]) {
        const ixObject:any = {
            routine: routine,
            arguments: args
        }

        if(routine.kind === "routine") {
            ixObject.call = (...args: any[]) => {
                return this.executeRoutine(ixObject, "call", ...args)
            }
        }

        ixObject.send = (...args: any[]) => {
            return this.executeRoutine(ixObject, "send", ...args)
        }

        ixObject.estimateGas = (...args: any[]) => {
            return this.executeRoutine(ixObject, "estimateGas", ...args)
        }

        ixObject.encodeRoutine = () => {
            return this.encodeRoutine(ixObject)
        }

        return ixObject
    }

    public setProvider(provider: string) {
        this.provider = provider;
    }

    public deploy(options: any, callback: Function) {
        const builder = Object.values(this.logicManifest.elements).find(element => 
            element.kind === "builder" && options.builderName === element.data.name
        )

        if(!builder) {
            callback(LogicErrors.builderNotFound())
        }

        if(builder.data.accepts && Object.keys(builder.data.accepts).length != options.arguments.length) {
            callback(LogicErrors.missingArguments())
        }

        return this.createIxObject(builder, ...options.arguments)
    }
}
