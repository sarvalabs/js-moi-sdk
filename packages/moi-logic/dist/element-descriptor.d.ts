import { LogicManifest } from "moi-utils";
import { ContextStateMatrix } from "./state";
import { CallSite } from "../types/logic";
export default class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element>;
    protected callSites: Map<string, CallSite>;
    protected classDefs: Map<string, number>;
    constructor(elements: LogicManifest.Element[]);
    getStateMatrix(): ContextStateMatrix;
    getElements(): Map<number, LogicManifest.Element>;
    getCallsites(): Map<string, CallSite>;
    getClassDefs(): Map<string, number>;
}
