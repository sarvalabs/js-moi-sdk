"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
class ElementDescriptor {
    stateMatrix;
    elements = new Map();
    callSites = new Map();
    classDefs = new Map();
    constructor(elements) {
        this.stateMatrix = new state_1.ContextStateMatrix(elements);
        elements.forEach(element => {
            this.elements.set(element.ptr, element);
            switch (element.kind) {
                case "class":
                    element.data = element.data;
                    this.classDefs.set(element.data.name, element.ptr);
                    break;
                case "routine":
                    element.data = element.data;
                    const callsite = { ptr: element.ptr, kind: element.data.kind };
                    this.callSites.set(element.data.name, callsite);
                    break;
                default:
                    break;
            }
        });
    }
    getStateMatrix() {
        return this.stateMatrix;
    }
    getElements() {
        return this.elements;
    }
    getCallsites() {
        return this.callSites;
    }
    getClassDefs() {
        return this.classDefs;
    }
}
exports.default = ElementDescriptor;
