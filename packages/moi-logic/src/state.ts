import { LogicManifest } from "moi-utils";

export enum ContextStateKind {
    PersistentState,
    EphemeralState
}

type ElementPtr = number;

export class ContextStateMatrix {
    private matrix: Map<ContextStateKind, ElementPtr>;

    constructor(stateElements: LogicManifest.Element[]) {
        this.matrix = new Map();
      
        for(let i = 0; i < stateElements.length; i++) {
            const stateElement = stateElements[i];
            stateElement.data = stateElement.data as LogicManifest.State;

            switch(stateElement.data.kind) {
                case "persistent":
                    if(this.persistent()) {
                        throw new Error("invalid state element: duplicate persistent state")
                    }

                    this.matrix.set(ContextStateKind.PersistentState, stateElement.ptr);
                    break;
                case "ephemeral":
                    throw new Error("ephemeral state elements are not supported")
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
