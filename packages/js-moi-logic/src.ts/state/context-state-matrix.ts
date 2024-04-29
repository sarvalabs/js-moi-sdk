import type { LogicManifest } from "js-moi-manifest";

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
    private matrix: Map<ContextStateKind, ElementPtr>;

    constructor(elements: LogicManifest.Element[]) {
        this.matrix = new Map();
        const stateElements = elements.filter((element) => element.kind === "state");

        for (let i = 0; i < stateElements.length; i++) {
            const stateElement = stateElements[i];
            stateElement.data = stateElement.data as LogicManifest.State;

            switch (stateElement.data.mode) {
                case "persistent":
                    this.matrix.set(ContextStateKind.PersistentState, stateElement.ptr);
                    break;
                case "ephemeral":
                default:
                    break;
            }
        }
    }

    /**
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns {boolean} A boolean indicating if persistent state is present.
     */
    public persistent(): boolean {
        return this.matrix.has(ContextStateKind.PersistentState);
    }

    /**
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns {boolean} A boolean indicating if ephemeral state is present.
     */
    public ephemeral(): boolean {
        return this.matrix.has(ContextStateKind.EphemeralState);
    }

    /**
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param {ContextStateKind} key - The context state kind.
     * @returns {number | undefined} The element pointer if found, otherwise undefined.
     */
    public get(key: ContextStateKind): number | undefined {
        return this.matrix.get(key);
    }
}
