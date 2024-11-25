import { ErrorCode, ErrorUtils } from "@zenz-solutions/js-moi-utils";
import type { LogicManifest } from "../types/manifest";
import { ContextStateMatrix } from "./context-state-matrix";



/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element> = new Map();
    protected callSites: Map<string, LogicManifest.CallSite> = new Map();
    protected classDefs: Map<string, number> = new Map();
    protected methodDefs: Map<string, LogicManifest.MethodDef> = new Map();
    protected eventsDefs = new Map<string, LogicManifest.EventDef>();

    constructor(elements: LogicManifest.Element[]) {
        this.stateMatrix = new ContextStateMatrix(elements);

        // Populate the maps for elements, call sites, class and method definitions.
        for (const element of elements) {
            this.elements.set(element.ptr, element);

            switch (element.kind) {
                case "class":
                    const classData = element.data as LogicManifest.Class;
                    this.classDefs.set("class." + classData.name, element.ptr);
                    break;
                case "method":
                    const methodData = element.data as LogicManifest.Method;
                    const methodDef: LogicManifest.MethodDef = {
                        ptr: element.ptr,
                        class: methodData.class,
                    };
                    this.methodDefs.set(methodData.name, methodDef);
                    break;
                case "routine":
                    const routineData = element.data as LogicManifest.Routine;
                    const callsite: LogicManifest.CallSite = {
                        ptr: element.ptr,
                        kind: routineData.kind,
                    };
                    this.callSites.set(routineData.name, callsite);
                break;
                case "event":
                    const eventData = element.data as LogicManifest.Event;
                    this.eventsDefs.set(eventData.name, { ptr: element.ptr, topics: eventData.topics });
                    break;
                default:
                    break;
            }
        }
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
    public getCallsites(): Map<string, LogicManifest.CallSite> {
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

    public getEvents(): Map<string, LogicManifest.EventDef> {
        return this.eventsDefs;
    }

    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    public getMethodDefs(): Map<string, LogicManifest.MethodDef> {
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
            return ErrorUtils.throwError(`Invalid class name: ${className}`, ErrorCode.INVALID_ARGUMENT);
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
     * routine name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {LogicManifest.Element} The routine element.
     * @throws {Error} if the routine name is invalid.
     */
    public getRoutineElement(routineName: string): LogicManifest.Element {
        const callsite = this.callSites.get(routineName);

        if (!callsite) {
            return ErrorUtils.throwError(`Invalid routine name: ${routineName}`, ErrorCode.INVALID_ARGUMENT);
        }

        return this.elements.get(callsite.ptr);
    }

    /**
     * Retrieves the element from the logic manifest based on the given
     * class name.
     *
     * @returns {LogicManifest.Element} The class element.
     * @throws {Error} if the class name is invalid.
     */
    public getClassElement(className: string): LogicManifest.Element {
        const ptr = this.classDefs.get(className);

        if (ptr === undefined) {
            return ErrorUtils.throwError(`Invalid routine name: ${className}`, ErrorCode.INVALID_ARGUMENT);
        }

        return this.elements.get(ptr);
    }

    /**
     * Retrieves the element from the logic manifest based on the given
     * method name.
     *
     * @param {string} methodName - The name of the method.
     * @returns {LogicManifest.Element} The method element.
     * @throws {Error} if the method name is invalid.
     */
    public getMethodElement(methodName: string): LogicManifest.Element {
        const methodDef = this.methodDefs.get(methodName);

        if (!methodDef) {
            return ErrorUtils.throwError(`Invalid routine name: ${methodName}`, ErrorCode.INVALID_ARGUMENT);
        }

        return this.elements.get(methodDef.ptr);
    }

    /**
     * Retrieves the element from the logic manifest based on the given
     * event name.
     * 
     * @param {string} eventName - The name of the event.
     * @returns {LogicManifest.Element<LogicManifest.Event>} The event element.
     * 
     * @throws {Error} if the event name is invalid.
     */
    public getEventElement(eventName: string) {
        const eventDef = this.eventsDefs.get(eventName);

        if (!eventDef) {
            return ErrorUtils.throwError(`Invalid event name: ${eventName}`, ErrorCode.INVALID_ARGUMENT);
        }

        return this.elements.get(eventDef.ptr) as LogicManifest.Element<LogicManifest.Event>;
    }
}
