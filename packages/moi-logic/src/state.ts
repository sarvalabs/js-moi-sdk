import { ErrorCode, ErrorUtils, LogicManifest, encodeToString } from "moi-utils";
import { blake2b } from 'blakejs';
import { BaseProvider } from "moi-providers";
import { ABICoder } from "moi-abi";

export enum ContextStateKind {
    PersistentState,
    EphemeralState
}

type ElementPtr = number;

/**
 * ContextStateMatrix
 * 
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and 
 ephemeral) and their element pointers.
 */
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
  
    /**
     * persistent
     * 
     * Checks if the matrix contains the pointer for persistent state.
     * 
     * @returns A boolean indicating if persistent state is present.
     */
    public persistent(): boolean {
      return this.matrix.has(ContextStateKind.PersistentState);
    }
  
    /**
     * ephemeral
     * 
     * Checks if the matrix contains the pointer for ephemeral state.
     * 
     * @returns A boolean indicating if ephemeral state is present.
     */
    public ephemeral(): boolean {
      return this.matrix.has(ContextStateKind.EphemeralState);
    }

    /**
     * get
     * 
     * Retrieves the element pointer for the specified context state kind.
     * 
     * @param key - The context state kind.
     * @returns The element pointer if found, otherwise undefined.
     */
    public get(key: ContextStateKind): number | undefined {
        return this.matrix.get(key);
    }
}

/**
 * PersistentState
 * 
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
    private slots:Map<string, string>;
    private types:Map<string, string>;
    private logicId: string;
    private provider: BaseProvider;
    private abiCoder: ABICoder;
    private element: LogicManifest.Element;

    constructor(
        logicId: string, 
        element: LogicManifest.Element, 
        abiCoder: ABICoder, 
        provider: BaseProvider
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

    /**
     * slotHash
     * 
     * Generates a hash of the slot using the Blake2b algorithm.
     * 
     * @param slot - The slot number to hash.
     * @returns The hash of the slot as a string.
     */
    private slotHash(slot: number): string {
        const hash = blake2b(new Uint8Array([slot]), null, 32);
      
        return encodeToString(hash)
    }

    /**
     * get
     * 
     * Retrieves the value of a persistent state field.
     * 
     * @param label - The label of the state field.
     * @returns A Promise that resolves to the value of the state field.
     * @throws If there is an error retrieving or decoding the state value.
     */
    public async get(label: string): Promise<any> {
        try {
            const slotHash = this.slots.get(label);

            if(slotHash) {
                const entry = await this.provider.getStorageAt(this.logicId, slotHash);
                this.element.data = this.element.data as LogicManifest.State;
                return this.abiCoder.decodeState(entry, label, this.element.data.fields);
            }

            ErrorUtils.throwError(
                `The provided slot "${label}" does not exist.`,
                ErrorCode.INVALID_ARGUMENT
            )
        } catch(err) {
            throw err
        }
    }
}

/**
 * EphemeralState
 * 
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
export class EphemeralState {
    constructor() {}

    /**
     * get
     * 
     * Throws an error as ephemeral state operations are temporarily not supported.
     * 
     * @param label - The label of the state field.
     * @throws Always throws an error indicating ephemeral state operations 
     are temporarily not supported.
     */
    public async get(label: string) {
        ErrorUtils.throwError(
            "Ephemeral state operations are temporarily not supported.",
            ErrorCode.UNSUPPORTED_OPERATION
        )
    }
}
