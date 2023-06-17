"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EphemeralState = exports.PersistentState = exports.ContextStateMatrix = exports.ContextStateKind = void 0;
const moi_utils_1 = require("moi-utils");
const blakejs_1 = require("blakejs");
var ContextStateKind;
(function (ContextStateKind) {
    ContextStateKind[ContextStateKind["PersistentState"] = 0] = "PersistentState";
    ContextStateKind[ContextStateKind["EphemeralState"] = 1] = "EphemeralState";
})(ContextStateKind = exports.ContextStateKind || (exports.ContextStateKind = {}));
/**
 * ContextStateMatrix
 *
 * Represents a matrix of context states defined in the logic manifest.
 * The matrix stores the mapping between context state kinds (persistent and
 ephemeral) and their element pointers.
 */
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
    /**
     * persistent
     *
     * Checks if the matrix contains the pointer for persistent state.
     *
     * @returns A boolean indicating if persistent state is present.
     */
    persistent() {
        return this.matrix.has(ContextStateKind.PersistentState);
    }
    /**
     * ephemeral
     *
     * Checks if the matrix contains the pointer for ephemeral state.
     *
     * @returns A boolean indicating if ephemeral state is present.
     */
    ephemeral() {
        return this.matrix.has(ContextStateKind.EphemeralState);
    }
    /**
     * get
     *
     * Retrieves the element pointer for the specified context state kind.
     *
     * @param key - The context state kind.
     * @returns The element pointer if found, otherwise undefined.
     */
    get(key) {
        return this.matrix.get(key);
    }
}
exports.ContextStateMatrix = ContextStateMatrix;
/**
 * PersistentState
 *
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
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
    /**
     * slotHash
     *
     * Generates a hash of the slot using the Blake2b algorithm.
     *
     * @param slot - The slot number to hash.
     * @returns The hash of the slot as a string.
     */
    slotHash(slot) {
        const hash = (0, blakejs_1.blake2b)(new Uint8Array([slot]), null, 32);
        return (0, moi_utils_1.encodeToString)(hash);
    }
    /**
     * get
     *
     * Retrieves the value of a persistent state field.
     *
     * @param label - The label of the state field.
     * @returns A Promise that resolves to the value of the state field.
     * @throws If there is an error retrieving or decoding the state value.
     */
    async get(label) {
        try {
            const slotHash = this.slots.get(label);
            if (slotHash) {
                const entry = await this.provider.getStorageAt(this.logicId, slotHash);
                this.element.data = this.element.data;
                return this.abiCoder.decodeState(entry, label, this.element.data.fields);
            }
            moi_utils_1.ErrorUtils.throwError(`The provided slot "${label}" does not exist.`, moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        catch (err) {
            throw err;
        }
    }
}
exports.PersistentState = PersistentState;
/**
 * EphemeralState
 *
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
class EphemeralState {
    constructor() { }
    /**
     * get
     *
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param label - The label of the state field.
     * @throws Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    async get(label) {
        moi_utils_1.ErrorUtils.throwError("Ephemeral state operations are temporarily not supported.", moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
}
exports.EphemeralState = EphemeralState;
