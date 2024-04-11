"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EphemeralState = exports.PersistentState = void 0;
const blake2b_1 = require("@noble/hashes/blake2b");
const js_moi_utils_1 = require("js-moi-utils");
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
class PersistentState {
    slots;
    types;
    logicId;
    provider;
    manifestCoder;
    element;
    constructor(logicId, element, manifestCoder, provider) {
        this.logicId = logicId;
        this.provider = provider;
        this.manifestCoder = manifestCoder;
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
     * Generates a hash of the slot using the Blake2b algorithm.
     *
     * @param {number} slot - The slot number to hash.
     * @returns {string} The hash of the slot as a string.
     */
    slotHash(slot) {
        const hash = (0, blake2b_1.blake2b)(new Uint8Array([slot]), {
            dkLen: 32,
        });
        return (0, js_moi_utils_1.encodeToString)(hash);
    }
    /**
     * Retrieves the value of a persistent state field.
     *
     * @param {string} label - The label of the state field.
     * @returns {Promise<any>} A Promise that resolves to the value of the
     * state field.
     * @throws {Error} If there is an error retrieving or decoding the state value.
     */
    async get(label) {
        try {
            const slotHash = this.slots.get(label);
            if (slotHash) {
                const entry = await this.provider.getStorageAt(this.logicId, slotHash);
                this.element.data = this.element.data;
                return this.manifestCoder.decodeState(entry, label, this.element.data.fields);
            }
            js_moi_utils_1.ErrorUtils.throwError(`The provided slot "${label}" does not exist.`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        catch (err) {
            throw err;
        }
    }
}
exports.PersistentState = PersistentState;
/**
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
class EphemeralState {
    constructor() { }
    /**
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param {string} label - The label of the state field.
     * @throws {Error} Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    async get(label) {
        js_moi_utils_1.ErrorUtils.throwError("Ephemeral state operations are temporarily not supported.", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
}
exports.EphemeralState = EphemeralState;
//# sourceMappingURL=state.js.map