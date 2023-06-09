import { LogicManifest } from "moi-utils";
import { ContextStateMatrix } from "./state";
import { CallSite } from "../types/logic";

export default class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element> = new Map();
    protected callSites: Map<string, CallSite> = new Map();
    protected classDefs: Map<string, number> = new Map();

    constructor(elements: LogicManifest.Element[]) {
        this.stateMatrix = new ContextStateMatrix(elements);
        elements.forEach(element => {
            this.elements.set(element.ptr, element);
            
            switch(element.kind){
                case "class":
                    element.data = element.data as LogicManifest.Class;
                    this.classDefs.set(element.data.name, element.ptr);
                    break;
                case "routine":
                    element.data = element.data as LogicManifest.Routine;
                    const callsite = { ptr: element.ptr, kind: element.data.kind };
                    this.callSites.set(element.data.name, callsite);
                    break;
                default:
                    break;
            }
        });
    }

    public getStateMatrix(): ContextStateMatrix {
        return this.stateMatrix;
    }

    public getElements(): Map<number, LogicManifest.Element> {
        return this.elements;
    }

    public getCallsites(): Map<string, CallSite> {
        return this.callSites;
    } 

    public getClassDefs(): Map<string, number> {
        return this.classDefs;
    }
}
