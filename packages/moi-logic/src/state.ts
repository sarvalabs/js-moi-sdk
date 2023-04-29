import { LogicManifest, encodeToString } from "moi-utils";
import { blake2b } from 'blakejs';
import { JsonRpcProvider } from "moi-providers";
import { ABICoder } from "moi-abi";

export enum ContextStateKind {
    PersistentState,
    EphemeralState
}

type ElementPtr = number;

export class ContextStateMatrix {
    private matrix: Map<ContextStateKind, ElementPtr>;

    constructor(elements: LogicManifest.Element[]) {
        this.matrix = new Map();

        const stateElements: any = elements.filter(element => 
            element.kind === "state"
        )
      
        for(let i = 0; i < stateElements.length; i++) {
            const stateElement = stateElements[i];
            stateElement.data = stateElement.data as LogicManifest.State;

            switch(stateElement.data.kind) {
                case "persistent":
                    this.matrix.set(
                        ContextStateKind.PersistentState, 
                        stateElement.ptr
                    );
                    break;
                case "ephemeral":
                default:
                    break;
            } 
        }
    }
  
    public persistent(): boolean {
      return this.matrix.has(ContextStateKind.PersistentState);
    }
  
    public ephemeral(): boolean {
      return this.matrix.has(ContextStateKind.EphemeralState);
    }

    public get(key: ContextStateKind): number | undefined {
        return this.matrix.get(key);
    }
}

export class PersistentState {
    private slots:Map<string, string>;
    private types:Map<string, string>;
    private logicId: string;
    private provider: JsonRpcProvider;
    private abiCoder: ABICoder;
    private element: LogicManifest.Element;

    constructor(
        logicId: string, 
        element: LogicManifest.Element, 
        abiCoder: ABICoder, 
        provider: JsonRpcProvider
    ) {
        this.logicId = logicId;
        this.provider = provider;
        this.abiCoder = abiCoder;
        this.element = element;
        this.slots = new Map()
        this.types = new Map()

        element.data = element.data as LogicManifest.State
        element.data.fields.forEach(element => {
            this.slots.set(element.label, this.slotHash(element.slot))
            this.types.set(element.label, element.type)
        })
    }

    private slotHash(slot: number): string {
        const hash = blake2b(new Uint8Array([slot]), null, 32);
      
        return encodeToString(hash)
    }

    public async get(label: string): Promise<any> {
        try {
            const slotHash = this.slots.get(label);
            const entry = await this.provider.getStorageAt(this.logicId, slotHash);
            this.element.data = this.element.data as LogicManifest.State;
            return this.abiCoder.decodeState(entry, label, this.element.data.fields);
        } catch(err) {
            throw err
        }
    }
}

export class EphemeralState {
    constructor() {}

    public async get(label: string) {
        throw new Error("ephemeral state elements are not supported")
    }
}
