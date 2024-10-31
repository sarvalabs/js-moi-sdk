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

  export interface MethodField {
    ptr: number | bigint;
    code: number | bigint;
  }

  export interface Class {
    name: string;
    fields?: TypeField[] | null;
    methods?: MethodField[] | null;
  }

  export interface State {
    mode: string;
    fields: TypeField[];
  }

  export interface Constant {
    type: string;
    value: string;
  }

  export interface Instructions {
    bin?: number[] | null;
    hex?: string;
    asm?: string[] | null;
  }

  export interface Routine {
    name: string;
    kind: string;
    mode: string;
    accepts?: TypeField[] | null;
    returns?: TypeField[] | null;
    executes: Instructions;
    catches?: string[] | null;
  }

  export interface Method {
    name: string;
    class: string;
    mutable: boolean;
    accepts?: TypeField[] | null;
    returns?: TypeField[] | null;
    executes: Instructions;
    catches?: string[] | null;
  }

  export interface Event {
    name: string;
    topics: number;
    fields: TypeField[];
  }

  export type TypeDef = string;

  export type ElementKind =
    | State
    | Constant
    | TypeDef
    | Routine
    | Class
    | Method
    | Event;

  export interface Element<TElementKind = ElementKind> {
    ptr: number;
    kind: string;
    deps?: number[] | null;
    data: TElementKind;
  }

  export interface Manifest {
    syntax: number;
    engine: EngineConfig;
    elements: Element[];
  }

  export interface EventDef {
    ptr: number;
    topics: number;
  }

  export interface MethodDef {
    ptr: number;
    class: string;
  }

  export interface CallSite {
    ptr: number;
    kind: string;
  }
  
  export interface EventDef {
    ptr: number;
    topics: number;
  }

  export interface MethodDef {
    ptr: number;
    class: string;
  }

  export interface CallSite {
    ptr: number;
    kind: string;
  }
}

