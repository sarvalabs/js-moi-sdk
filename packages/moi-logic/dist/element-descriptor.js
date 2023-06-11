"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moi_utils_1 = require("moi-utils");
const state_1 = require("./state");
/**
 * ElementDescriptor Class
 *
 * This class represents a descriptor for elements in the logic manifest.
 */
class ElementDescriptor {
    stateMatrix;
    elements = new Map();
    callSites = new Map();
    classDefs = new Map();
    constructor(elements) {
        this.stateMatrix = new state_1.ContextStateMatrix(elements);
        // Populate the maps for elements, call sites, and class definitions
        elements.forEach(element => {
            this.elements.set(element.ptr, element);
            switch (element.kind) {
                case "class":
                    element.data = element.data;
                    this.classDefs.set(element.data.name, element.ptr);
                    break;
                case "routine":
                    element.data = element.data;
                    const callsite = {
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
    getStateMatrix() {
        return this.stateMatrix;
    }
    /**
     * getElements
     *
     * Retrieves the map of elements associated with the ElementDescriptor.
     *
     * @returns {Map<number, LogicManifest.Element>} The elements map.
     */
    getElements() {
        return this.elements;
    }
    /**
     * getCallsites
     *
     * Retrieves the map of call sites associated with the ElementDescriptor.
     *
     * @returns {Map<string, CallSite>} The call sites map.
     */
    getCallsites() {
        return this.callSites;
    }
    /**
     * getClassDefs
     *
     * Retrieves the map of class definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, number>} The class definitions map.
     */
    getClassDefs() {
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
    getRoutineElement(name) {
        const callsite = this.callSites.get(name);
        if (!callsite) {
            return moi_utils_1.ErrorUtils.throwError(`Invalid routine name: ${name}`, moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return this.elements.get(callsite.ptr);
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
    getClassElement(name) {
        const ptr = this.classDefs.get(name);
        if (!ptr) {
            return moi_utils_1.ErrorUtils.throwError(`Invalid routine name: ${name}`, moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return this.elements.get(ptr);
    }
}
exports.default = ElementDescriptor;
