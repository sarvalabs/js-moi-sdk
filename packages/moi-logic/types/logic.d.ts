import { InteractionResponse } from "moi-providers";
import { LogicManifest } from "moi-manifest";

export interface LogicDeployRequest {
    send: (args: any) => Promise<InteractionResponse>;
    estimateGas: (args: any) => Promise<any>;
}

export interface LogicExecuteRequest {
    call: (args: any) => Promise<any>;
    send: (args: any) => Promise<InteractionResponse>;
    estimateGas: (args: any) => Promise<any>;
}

export interface Routine {
    (args?: any[]): any;
    isMutable: () => boolean;
    accepts: () => LogicManifest.TypeField[] | null;
    returns: () => LogicManifest.TypeField[] | null;
}
  
export interface Routines {
    [name: string]: Routine;
}

export interface CallSite {
    ptr: number,
    kind: string
}

export interface MethodDef {
    ptr: number;
    class: string;
}
