import ABICoder from "moi-abi";
import LogicManifest from "moi-abi/types/manifest";
import { LogicDeployRequest } from "../types/logic";
import { JsonRpcProvider } from "moi-providers"
import Errors from "./errors";
import LogicErrors from "./errors";

export class LogicFactory {
    private manifest: LogicManifest.Manifest;
    private encodedManifest: string;
    private provider: JsonRpcProvider;

    constructor(manifest: LogicManifest.Manifest, provider: JsonRpcProvider) {
        this.manifest = manifest;
        this.encodedManifest = ABICoder.encodeABI(manifest);
        this.provider = provider;
    }

    private createPayload(ixObject: any): any {
        const payload: any = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.data.name
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

            processedArgs.params.type = 7;
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

    private createIxObject(routine: any, ...args: any[]) {
        const ixObject:any = {
            routine: routine,
            arguments: args
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

        return ixObject
    }

    private createIxRequest(ixObject: any): LogicDeployRequest {
        return {
            send: ixObject.send.bind(ixObject),
            estimateGas: ixObject.estimateGas.bind(ixObject)
        }
    }

    public deploy(options: any, callback: Function): LogicDeployRequest {
        const builder = Object.values(this.manifest.elements)
        .find(element => {
            if(element.kind === "routine"){
                element.data = element.data as LogicManifest.Routine
                return element.data.kind === "deployer" && 
                options.builderName === element.data.name
            }

            return false
        })

        if(builder) {
            builder.data = builder.data as LogicManifest.Routine

            if(builder.data.accepts && Object.keys(builder.data.accepts).length != options.arguments.length) {
                callback(LogicErrors.missingArguments())
            }
    
            const ixObject = this.createIxObject(builder, ...options.arguments)

            return this.createIxRequest(ixObject);
        }

        callback(LogicErrors.builderNotFound())

        throw LogicErrors.builderNotFound()
    }
}
