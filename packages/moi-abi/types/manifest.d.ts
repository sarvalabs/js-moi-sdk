declare module LogicManifest {
    export interface EngineConfig {
        kind: string;
        flags: string[];
    }
    
    export interface TypeField {
        label: string;
        type: string;
    }
    
    export interface Storage {
        scope: string;
        fields: Record<string, TypeField> | Map<string, TypeField>;
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
        accepts?: Record<string, TypeField> | Map<string, TypeField>;
        returns: Record<string, TypeField> | Map<string, TypeField>;
        catches?: string[];
        executes: Instructions
    }
    
    export interface Builder {
        name: string;
        scope: string;
        accepts: Record<string, TypeField> | Map<string, TypeField>;
        returns?: Record<string, TypeField> | Map<string, TypeField>;
        catches?: string[];
        executes: Instructions;
    }
    
    export type TypeDef = string;
    
    export interface Element {
        kind: string;
        deps?: number[];
        data: Storage | Constant | TypeDef | Routine | Builder;
    }
    
    export interface Manifest {
        syntax: string;
        engine: EngineConfig;
        elements: Record<string, Element> | Map<string, Element>;
    }
}

export default LogicManifest;