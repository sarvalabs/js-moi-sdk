import { ElementType, LogicState, type LogicElement } from "js-moi-utils";

export enum ContextStateKind {
    PersistentState,
    EphemeralState,
}

type ElementPtr = number;

/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and 
 ephemeral) and their element pointers.
 */
export class ContextStateMatrix {
    private matrix: Map<LogicState, ElementPtr>;

    constructor(elements: LogicElement[]) {
        this.matrix = new Map(elements.filter((elm) => elm.kind === ElementType.State).map((element) => [element.data.mode, element.ptr]));
    }

    /**
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns {boolean} A boolean indicating if persistent state is present.
     */
    public persistent(): boolean {
        return this.matrix.has(LogicState.Persistent);
    }

    /**
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns {boolean} A boolean indicating if ephemeral state is present.
     */
    public ephemeral(): boolean {
        return this.matrix.has(LogicState.Ephemeral);
    }

    /**
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    public get(key: LogicState): number | undefined {
        return this.matrix.get(key);
    }
}
