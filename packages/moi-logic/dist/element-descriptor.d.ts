import { LogicManifest } from "moi-utils";
import { ContextStateMatrix } from "./state";
import { CallSite } from "../types/logic";
/**
 * ElementDescriptor Class
 *
 * This class represents a descriptor for elements in the logic manifest.
 */
export default class ElementDescriptor {
    protected stateMatrix: ContextStateMatrix;
    protected elements: Map<number, LogicManifest.Element>;
    protected callSites: Map<string, CallSite>;
    protected classDefs: Map<string, number>;
    constructor(elements: LogicManifest.Element[]);
    /**
     * getStateMatrix
     *
     * Retrieves the state matrix associated with the ElementDescriptor.
     *
     * @returns {ContextStateMatrix} The state matrix.
     */
    getStateMatrix(): ContextStateMatrix;
    /**
     * getElements
     *
     * Retrieves the map of elements associated with the ElementDescriptor.
     *
     * @returns {Map<number, LogicManifest.Element>} The elements map.
     */
    getElements(): Map<number, LogicManifest.Element>;
    /**
     * getCallsites
     *
     * Retrieves the map of call sites associated with the ElementDescriptor.
     *
     * @returns {Map<string, CallSite>} The call sites map.
     */
    getCallsites(): Map<string, CallSite>;
    /**
     * getClassDefs
     *
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, number>} The class definitions map.
     */
    getClassDefs(): Map<string, number>;
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
    getRoutineElement(name: string): LogicManifest.Element;
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
    getClassElement(name: string): LogicManifest.Element;
}
