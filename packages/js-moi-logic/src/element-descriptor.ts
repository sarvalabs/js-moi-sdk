import { LogicManifest } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { ContextStateMatrix } from "./state";
import { CallSite, MethodDef } from "../types/logic";

/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export default class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element> = new Map();
    protected callSites: Map<string, CallSite> = new Map();
    protected classDefs: Map<string, number> = new Map();
    protected methodDefs: Map<string, MethodDef> = new Map();

    constructor(elements: LogicManifest.Element[]) {
        this.stateMatrix = new ContextStateMatrix(elements);

        // Populate the maps for elements, call sites, class and method definitions.
        elements.forEach(element => {
            this.elements.set(element.ptr, element);
            
            switch(element.kind){
                case "class":
                    const classData = element.data as LogicManifest.Class;
                    this.classDefs.set(classData.name, element.ptr);
                    break;
                case "method":
                    const methodData = element.data as LogicManifest.Method;
                    const methodDef: MethodDef = {
                        ptr: element.ptr,
                        class: methodData.class
                    };
                    this.methodDefs.set(methodData.name, methodDef);
                    break;
                case "routine":
                    const routineData = element.data as LogicManifest.Routine;
                    const callsite: CallSite = { 
                        ptr: element.ptr, 
                        kind: routineData.kind 
                    };
                    this.callSites.set(routineData.name, callsite);
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Retrieves the state matrix associated with the ElementDescriptor.
     * 
     * @returns {ContextStateMatrix} The state matrix.
     */
    public getStateMatrix(): ContextStateMatrix {
        return this.stateMatrix;
    }

    /**
     * Retrieves the map of elements associated with the ElementDescriptor.
     * 
     * @returns {Map<number, LogicManifest.Element>} The elements map.
     */
    public getElements(): Map<number, LogicManifest.Element> {
        return this.elements;
    }

    /**
     * Retrieves the map of call sites associated with the ElementDescriptor.
     * 
     * @returns {Map<string, CallSite>} The call sites map.
     */
    public getCallsites(): Map<string, CallSite> {
        return this.callSites;
    } 

    /**
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     * 
     * @returns {Map<string, number>} The class definitions map.
     */
    public getClassDefs(): Map<string, number> {
        return this.classDefs;
    }

    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     * 
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    public getMethodDefs(): Map<string, MethodDef> {
        return this.methodDefs;
    }

    /**
     * Retrieves the methods of a class based on the given class name.
     * 
     * @param {string} className - The name of the class.
     * @returns {Map<string, LogicManifest.Method>} The methods of the class.
     * @throws {Error} if the class name is invalid.
     */
    public getClassMethods(className: string): Map<string, LogicManifest.Method> {
        const classPtr = this.classDefs.get(className);
        
        if (classPtr === undefined) {
            return ErrorUtils.throwError(
                `Invalid class name: ${className}`,
                ErrorCode.INVALID_ARGUMENT
            );
        }
    
        const classMethods: Map<string, LogicManifest.Method> = new Map();
        this.methodDefs.forEach((method, methodName) => {
            if (method.class === className) {
                const element = this.elements.get(method.ptr);
                classMethods.set(methodName, element.data as LogicManifest.Method);
            }
        });
    
        return classMethods;
    }

    /**
     * Retrieves the element from the logic manifest based on the given 
     routine name.
     * 
     * @param {string} routineName - The name of the routine.
     * @returns {LogicManifest.Element} The routine element.
     * @throws {Error} if the routine name is invalid.
     */
    public getRoutineElement(routineName: string): LogicManifest.Element {
        const callsite = this.callSites.get(routineName);

        if (!callsite) {
            return ErrorUtils.throwError(
                `Invalid routine name: ${routineName}`,
                ErrorCode.INVALID_ARGUMENT
            )
        }

        return this.elements.get(callsite.ptr);
    }

    /**
     * Retrieves the element from the logic manifest based on the given 
     class name.
     * 
     * @returns {LogicManifest.Element} The class element.
     * @throws {Error} if the class name is invalid.
     */
    public getClassElement(className: string): LogicManifest.Element {
        const ptr = this.classDefs.get(className);

        if (ptr === undefined) {
            return ErrorUtils.throwError(
                `Invalid routine name: ${className}`,
                ErrorCode.INVALID_ARGUMENT
            )
        }

        return this.elements.get(ptr);
    }

    /**
     * Retrieves the element from the logic manifest based on the given 
     method name.
     * 
     * @param {string} methodName - The name of the method.
     * @returns {LogicManifest.Element} The method element.
     * @throws {Error} if the method name is invalid.
     */
    public getMethodElement(methodName: string): LogicManifest.Element {
        const methodDef = this.methodDefs.get(methodName);

        if (!methodDef) {
            return ErrorUtils.throwError(
                `Invalid routine name: ${methodName}`,
                ErrorCode.INVALID_ARGUMENT
            )
        }

        return this.elements.get(methodDef.ptr);
    }
}
