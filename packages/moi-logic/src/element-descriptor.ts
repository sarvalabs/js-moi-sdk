import { ErrorCode, ErrorUtils, LogicManifest } from "moi-utils";
import { ContextStateMatrix } from "./state";
import { CallSite } from "../types/logic";

/**
 * ElementDescriptor Class
 * 
 * This class represents a descriptor for elements in the logic manifest.
 */
export default class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element> = new Map();
    protected callSites: Map<string, CallSite> = new Map();
    protected classDefs: Map<string, number> = new Map();

    constructor(elements: LogicManifest.Element[]) {
        this.stateMatrix = new ContextStateMatrix(elements);

        // Populate the maps for elements, call sites, and class definitions
        elements.forEach(element => {
            this.elements.set(element.ptr, element);
            
            switch(element.kind){
                case "class":
                    element.data = element.data as LogicManifest.Class;
                    this.classDefs.set(element.data.name, element.ptr);
                    break;
                case "routine":
                    element.data = element.data as LogicManifest.Routine;
                    const callsite: CallSite = { 
                        ptr: element.ptr, 
                        kind: element.data.kind 
                    };
                    this.callSites.set(element.data.name, callsite);
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * getStateMatrix
     * 
     * Retrieves the state matrix associated with the ElementDescriptor.
     * 
     * @returns {ContextStateMatrix} The state matrix.
     */
    public getStateMatrix(): ContextStateMatrix {
        return this.stateMatrix;
    }

    /**
     * getElements
     * 
     * Retrieves the map of elements associated with the ElementDescriptor.
     * 
     * @returns {Map<number, LogicManifest.Element>} The elements map.
     */
    public getElements(): Map<number, LogicManifest.Element> {
        return this.elements;
    }

    /**
     * getCallsites
     * 
     * Retrieves the map of call sites associated with the ElementDescriptor.
     * 
     * @returns {Map<string, CallSite>} The call sites map.
     */
    public getCallsites(): Map<string, CallSite> {
        return this.callSites;
    } 

    /**
     * getClassDefs
     * 
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     * 
     * @returns {Map<string, number>} The class definitions map.
     */
    public getClassDefs(): Map<string, number> {
        return this.classDefs;
    }

    /**
     * getRoutineElement
     * 
     * Retrieves the element from the logic manifest based on the given 
     routine name.
     * 
     * @param {string} name - The name of the routine.
     * @returns {LogicManifest.Element} The routine element, or throws an error 
     if the routine name is invalid.
     */
    public getRoutineElement(name: string): LogicManifest.Element {
        const callsite = this.callSites.get(name);

        if (!callsite) {
            return ErrorUtils.throwError(
                `Invalid routine name: ${name}`,
                ErrorCode.INVALID_ARGUMENT
            )
        }

        return this.elements.get(callsite.ptr)
    }

    /**
     * getClassElement
     * 
     * Retrieves the element from the logic manifest based on the given 
     class name.
     * 
     * @param {string} name - The name of the class.
     * @returns {LogicManifest.Element} The class element, or throws an error 
     if the class name is invalid.
     */
    public getClassElement(name: string): LogicManifest.Element {
        const ptr = this.classDefs.get(name);

        if (!ptr) {
            return ErrorUtils.throwError(
                `Invalid routine name: ${name}`,
                ErrorCode.INVALID_ARGUMENT
            )
        }

        return this.elements.get(ptr)
    }
}
