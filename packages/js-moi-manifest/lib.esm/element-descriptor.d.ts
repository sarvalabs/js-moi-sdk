import type { LogicManifest } from "../types/manifest";
import { ContextStateMatrix } from "./context-state-matrix";
/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export declare class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element>;
    protected callSites: Map<string, LogicManifest.CallSite>;
    protected classDefs: Map<string, number>;
    protected methodDefs: Map<string, LogicManifest.MethodDef>;
    protected eventsDefs: Map<string, LogicManifest.EventDef>;
    constructor(elements: LogicManifest.Element[]);
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
    getElements(): Map<number, LogicManifest.Element>;
    /**
     * Retrieves the map of call sites associated with the ElementDescriptor.
     *
     * @returns {Map<string, CallSite>} The call sites map.
     */
    getCallsites(): Map<string, LogicManifest.CallSite>;
    /**
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, number>} The class definitions map.
     */
    getClassDefs(): Map<string, number>;
    getEvents(): Map<string, LogicManifest.EventDef>;
    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    getMethodDefs(): Map<string, LogicManifest.MethodDef>;
    /**
     * Retrieves the methods of a class based on the given class name.
     *
     * @param {string} className - The name of the class.
     * @returns {Map<string, LogicManifest.Method>} The methods of the class.
     * @throws {Error} if the class name is invalid.
     */
    getClassMethods(className: string): Map<string, LogicManifest.Method>;
    /**
     * Retrieves the element from the logic manifest based on the given
     * routine name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {LogicManifest.Element} The routine element.
     * @throws {Error} if the routine name is invalid.
     */
    getRoutineElement(routineName: string): LogicManifest.Element;
    /**
     * Retrieves the element from the logic manifest based on the given
     * class name.
     *
     * @returns {LogicManifest.Element} The class element.
     * @throws {Error} if the class name is invalid.
     */
    getClassElement(className: string): LogicManifest.Element;
    /**
     * Retrieves the element from the logic manifest based on the given
     * method name.
     *
     * @param {string} methodName - The name of the method.
     * @returns {LogicManifest.Element} The method element.
     * @throws {Error} if the method name is invalid.
     */
    getMethodElement(methodName: string): LogicManifest.Element;
    /**
     * Retrieves the element from the logic manifest based on the given
     * event name.
     *
     * @param {string} eventName - The name of the event.
     * @returns {LogicManifest.Element<LogicManifest.Event>} The event element.
     *
     * @throws {Error} if the event name is invalid.
     */
    getEventElement(eventName: string): LogicManifest.Element<LogicManifest.Event>;
}
//# sourceMappingURL=element-descriptor.d.ts.map