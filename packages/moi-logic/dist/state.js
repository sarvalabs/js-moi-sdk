"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EphemeralState = exports.PersistentState = exports.ContextStateMatrix = exports.ContextStateKind = void 0;
const moi_utils_1 = require("moi-utils");
const blakejs_1 = require("blakejs");
var ContextStateKind;
(function (ContextStateKind) {
    ContextStateKind[ContextStateKind["PersistentState"] = 0] = "PersistentState";
    ContextStateKind[ContextStateKind["EphemeralState"] = 1] = "EphemeralState";
})(ContextStateKind || (exports.ContextStateKind = ContextStateKind = {}));
class ContextStateMatrix {
    matrix;
    constructor(elements) {
        this.matrix = new Map();
        const stateElements = elements.filter(element => element.kind === "state");
        for (let i = 0; i < stateElements.length; i++) {
            const stateElement = stateElements[i];
            stateElement.data = stateElement.data;
            switch (stateElement.data.kind) {
                case "persistent":
                    this.matrix.set(ContextStateKind.PersistentState, stateElement.ptr);
                    break;
                case "ephemeral":
                default:
                    break;
            }
        }
    }
    persistent() {
        return this.matrix.has(ContextStateKind.PersistentState);
    }
    ephemeral() {
        return this.matrix.has(ContextStateKind.EphemeralState);
    }
    get(key) {
        return this.matrix.get(key);
    }
}
exports.ContextStateMatrix = ContextStateMatrix;
class PersistentState {
    slots;
    types;
    logicId;
    provider;
    abiCoder;
    element;
    constructor(logicId, element, abiCoder, provider) {
        this.logicId = logicId;
        this.provider = provider;
        this.abiCoder = abiCoder;
        this.element = element;
        this.slots = new Map();
        this.types = new Map();
        element.data = element.data;
        element.data.fields.forEach(element => {
            this.slots.set(element.label, this.slotHash(element.slot));
            this.types.set(element.label, element.type);
        });
    }
    slotHash(slot) {
        const hash = (0, blakejs_1.blake2b)(new Uint8Array([slot]), null, 32);
        return (0, moi_utils_1.encodeToString)(hash);
    }
    async get(label) {
        try {
            const slotHash = this.slots.get(label);
            const entry = await this.provider.getStorageAt(this.logicId, slotHash);
            this.element.data = this.element.data;
            return this.abiCoder.decodeState(entry, label, this.element.data.fields);
        }
        catch (err) {
            throw err;
        }
    }
}
exports.PersistentState = PersistentState;
class EphemeralState {
    constructor() { }
    async get(label) {
        throw new Error("ephemeral state elements are not supported");
    }
}
exports.EphemeralState = EphemeralState;
