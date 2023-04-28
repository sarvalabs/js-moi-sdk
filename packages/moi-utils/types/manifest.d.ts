export declare module LogicManifest {
    export interface EngineConfig {
        kind: string;
        flags: string[];
    }
    
    export interface TypeField {
        slot: number;
        label: string;
        type: string;
    }

    export interface Class {
        name: string,
        fields: TypeField[]
    }
    
    export interface State {
        kind: string;
        fields: TypeField[];
    }
    
    export interface Constant {
        type: string;
        value: string;
    }
    
    export interface Instructions {
        bin?: number[];
        hex?: string;
        asm?: string[];
    }
    
    export interface Routine {
        name: string;
        kind: string;
        accepts?: TypeField[];
        returns?: TypeField[];
        catches?: string[];
        executes: Instructions
    }
    
    export type TypeDef = string;
    
    export interface Element {
        ptr: number;
        kind: string;
        deps?: number[];
        data: State | Constant | TypeDef | Routine | Class;
    }
    
    export interface Manifest {
        syntax: string;
        engine: EngineConfig;
        elements: Element[];
    }
}
