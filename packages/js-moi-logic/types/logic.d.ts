import { InteractionCallResponse, InteractionResponse } from "js-moi-providers";
import { LogicManifest } from "js-moi-manifest";

export interface LogicIxRequest {
    call: (args: any) => Promise<InteractionCallResponse>;
    send: (args: any) => Promise<InteractionResponse>;
    estimateFuel: (args: any) => Promise<number|bigint>;
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
