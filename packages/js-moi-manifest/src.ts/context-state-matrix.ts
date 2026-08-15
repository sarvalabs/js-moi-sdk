import type { LogicManifest } from "../types/manifest";

export enum ContextStateKind {
    LogicState,
    ActorState,
}

type ElementPtr = number;

/**
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds - logic state
 * (`state logic:`, shared/global to the logic itself - what this SDK used to
 * call "persistent" state) and actor state (`state actor:`, scoped per
 * calling participant - what this SDK used to call "ephemeral" state) - and
 * their element pointers.
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
                case "logic":
                    this.matrix.set(ContextStateKind.LogicState, stateElement.ptr);
                    break;
                case "actor":
                    this.matrix.set(ContextStateKind.ActorState, stateElement.ptr);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Checks if the matrix contains the pointer for logic state.
     *
     * @returns {boolean} A boolean indicating if logic state is present.
     */
    public logic(): boolean {
        return this.matrix.has(ContextStateKind.LogicState);
    }

    /**
     * Checks if the matrix contains the pointer for actor state.
     *
     * @returns {boolean} A boolean indicating if actor state is present.
     */
    public actor(): boolean {
        return this.matrix.has(ContextStateKind.ActorState);
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
