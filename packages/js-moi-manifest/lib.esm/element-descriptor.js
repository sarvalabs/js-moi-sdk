import { ElementType, ErrorCode, ErrorUtils } from "js-moi-utils";
import { ContextStateMatrix } from "./context-state-matrix";
/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export class ElementDescriptor {
    stateMatrix;
    elements = new Map();
    callSites = new Map();
    classDefs = new Map();
    methodDefs = new Map();
    eventsDefs = new Map();
    constructor(elements) {
        this.stateMatrix = new ContextStateMatrix(elements);
        // Populate the maps for elements, call sites, class and method definitions.
        for (const element of elements) {
            this.elements.set(element.ptr, element);
            switch (element.kind) {
                case ElementType.Class:
                    this.classDefs.set("class." + element.data.name, element.ptr);
                    break;
                case ElementType.Method:
                    this.methodDefs.set(element.data.name, {
                        ptr: element.ptr,
                        class: element.data.class,
                    });
                    break;
                case ElementType.Routine:
                    this.callSites.set(element.data.name, {
                        ptr: element.ptr,
                        kind: element.data.kind,
                    });
                    break;
                case "event":
                    this.eventsDefs.set(element.data.name, {
                        ptr: element.ptr,
                        topics: element.data.topics,
                    });
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
    getStateMatrix() {
        return this.stateMatrix;
    }
    /**
     * Retrieves the map of elements associated with the ElementDescriptor.
     *
     * @returns {Map<number, LogicManifest.Element>} The elements map.
     */
    getElements() {
        return this.elements;
    }
    /**
     * Retrieves the map of call sites associated with the ElementDescriptor.
     *
     * @returns {Map<string, CallSite>} The call sites map.
     */
    getCallsites() {
        return this.callSites;
    }
    /**
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, number>} The class definitions map.
     */
    getClassDefs() {
        return this.classDefs;
    }
    getEvents() {
        return this.eventsDefs;
    }
    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    getMethodDefs() {
        return this.methodDefs;
    }
    /**
     * Retrieves the methods of a class based on the given class name.
     *
     * @param {string} className - The name of the class.
     * @returns {Map<string, LogicManifest.Method>} The methods of the class.
     * @throws {Error} if the class name is invalid.
     */
    getClassMethods(className) {
        const classPtr = this.classDefs.get(className);
        if (classPtr === undefined) {
            return ErrorUtils.throwError(`Invalid class name: ${className}`, ErrorCode.INVALID_ARGUMENT);
        }
        const classMethods = new Map();
        this.methodDefs.forEach((method, methodName) => {
            if (method.class === className) {
                const element = this.elements.get(method.ptr);
                if (element == null || element.kind !== ElementType.Method) {
                    return;
                }
                classMethods.set(methodName, element.data);
            }
        });
        return classMethods;
    }
    /**
     * Retrieves the element from the logic manifest based on the given
     * routine name.
     *
     * @param {string} name - The name of the routine.
     * @returns The routine element.
     * @throws {Error} if the routine name is invalid.
     */
    getRoutineElement(name) {
        const callsite = this.callSites.get(name);
        if (!callsite) {
            ErrorUtils.throwError(`Routine name "${name}" not found.`, ErrorCode.INVALID_ARGUMENT);
        }
        const element = this.elements.get(callsite.ptr);
        if (element == null || element.kind !== ElementType.Routine) {
            return ErrorUtils.throwError(`Routine name "${name}" is invalid.`, ErrorCode.INVALID_ARGUMENT);
        }
        return element;
    }
    /**
     * Retrieves the element from the logic manifest based on the given
     * class name.
     *
     * @returns {LogicManifest.Element} The class element.
     * @throws {Error} if the class name is invalid.
     */
    getClassElement(className) {
        const ptr = this.classDefs.get(className);
        if (ptr === undefined) {
            return ErrorUtils.throwError(`Invalid routine name: ${className}`, ErrorCode.INVALID_ARGUMENT);
        }
        const element = this.elements.get(ptr);
        if (element == null || element.kind !== ElementType.Class) {
            return ErrorUtils.throwError(`Invalid routine name: ${className}`, ErrorCode.INVALID_ARGUMENT);
        }
        return element;
    }
    /**
     * Retrieves the element from the logic manifest based on the given
     * method name.
     *
     * @param {string} methodName - The name of the method.
     * @returns {LogicManifest.Element} The method element.
     * @throws {Error} if the method name is invalid.
     */
    getMethodElement(methodName) {
        const methodDef = this.methodDefs.get(methodName);
        if (!methodDef) {
            return ErrorUtils.throwError(`Invalid method name: ${methodName}`, ErrorCode.INVALID_ARGUMENT);
        }
        const element = this.elements.get(methodDef.ptr);
        if (element == null || element.kind !== ElementType.Method) {
            return ErrorUtils.throwError(`Invalid method name: ${methodName}`, ErrorCode.INVALID_ARGUMENT);
        }
        return element;
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
    getEventElement(eventName) {
        const eventDef = this.eventsDefs.get(eventName);
        if (!eventDef) {
            return ErrorUtils.throwError(`Invalid event name: ${eventName}`, ErrorCode.INVALID_ARGUMENT);
        }
        const element = this.elements.get(eventDef.ptr);
        if (element == null || element.kind !== ElementType.Event) {
            return ErrorUtils.throwError(`Invalid event name: ${eventName}`, ErrorCode.INVALID_ARGUMENT);
        }
        return element;
    }
}
//# sourceMappingURL=element-descriptor.js.map