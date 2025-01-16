import { Element, ElementType, type ElementData, type LogicElement } from "js-moi-utils";
import { ContextStateMatrix } from "./context-state-matrix";
import type { EventDef, MethodDef, RoutineDef } from "./types/manifest";
/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export declare class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<LogicElement["ptr"], LogicElement>;
    protected callSites: Map<string, RoutineDef>;
    protected classDefs: Map<string, number>;
    protected methodDefs: Map<string, MethodDef>;
    protected eventsDefs: Map<string, EventDef>;
    constructor(elements: LogicElement[]);
    /**
     * Retrieves the state matrix associated with the ElementDescriptor.
     *
     * @returns {ContextStateMatrix} The state matrix.
     */
    getStateMatrix(): ContextStateMatrix;
    /**
     * Retrieves the map of elements associated with the ElementDescriptor.
     *
     * @returns {Map<number, LogicManifest.Element>} The elements map.
     */
    getElements(): Map<number, LogicElement>;
    /**
     * Retrieves the map of call sites associated with the ElementDescriptor.
     *
     * @returns {Map<string, CallSite>} The call sites map.
     */
    getCallsites(): Map<string, RoutineDef>;
    /**
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, number>} The class definitions map.
     */
    getClassDefs(): Map<string, number>;
    getEvents(): Map<string, EventDef>;
    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    getMethodDefs(): Map<string, MethodDef>;
    /**
     * Retrieves the methods of a class based on the given class name.
     *
     * @param {string} className - The name of the class.
     * @returns {Map<string, LogicManifest.Method>} The methods of the class.
     * @throws {Error} if the class name is invalid.
     */
    getClassMethods(className: string): Map<string, ElementData<ElementType.Method>>;
    /**
     * Retrieves the element from the logic manifest based on the given
     * routine name.
     *
     * @param {string} name - The name of the routine.
     * @returns The routine element.
     * @throws {Error} if the routine name is invalid.
     */
    getRoutineElement(name: string): Element<ElementType.Routine>;
    /**
     * Retrieves the element from the logic manifest based on the given
     * class name.
     *
     * @returns {LogicManifest.Element} The class element.
     * @throws {Error} if the class name is invalid.
     */
    getClassElement(className: string): Element<ElementType.Class>;
    /**
     * Retrieves the element from the logic manifest based on the given
     * method name.
     *
     * @param {string} methodName - The name of the method.
     * @returns {LogicManifest.Element} The method element.
     * @throws {Error} if the method name is invalid.
     */
    getMethodElement(methodName: string): Element<ElementType.Method>;
    /**
     * Retrieves the element from the logic manifest based on the given
     * event name.
     *
     * @param {string} eventName - The name of the event.
     * @returns {LogicManifest.Element<LogicManifest.Event>} The event element.
     *
     * @throws {Error} if the event name is invalid.
     */
    getEventElement(eventName: string): Element<ElementType.Event>;
}
//# sourceMappingURL=element-descriptor.d.ts.map