import { LogicManifest } from "moi-utils";
import { JsonRpcProvider } from "moi-providers";
import { ABICoder } from "moi-abi";
export declare enum ContextStateKind {
    PersistentState = 0,
    EphemeralState = 1
}
export declare class ContextStateMatrix {
    private matrix;
    constructor(elements: LogicManifest.Element[]);
    persistent(): boolean;
    ephemeral(): boolean;
    get(key: ContextStateKind): number | undefined;
}
export declare class PersistentState {
    private slots;
    private types;
    private logicId;
    private provider;
    private abiCoder;
    private element;
    constructor(logicId: string, element: LogicManifest.Element, abiCoder: ABICoder, provider: JsonRpcProvider);
    private slotHash;
    get(label: string): Promise<any>;
}
export declare class EphemeralState {
    constructor();
    get(label: string): Promise<void>;
}
