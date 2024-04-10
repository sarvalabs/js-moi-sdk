import { blake2b } from "@noble/hashes/blake2b";
import { ErrorCode, ErrorUtils, encodeToString } from "js-moi-utils";
/**
 * Represents persistent state functionality for a logic element.
 * Manages slots, types, and retrieval of persistent state values.
 */
export class PersistentState {
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
        const hash = blake2b(new Uint8Array([slot]), {
            dkLen: 32,
        });
        return encodeToString(hash);
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
            ErrorUtils.throwError(`The provided slot "${label}" does not exist.`, ErrorCode.INVALID_ARGUMENT);
        }
        catch (err) {
            throw err;
        }
    }
}
/**
 * Represents ephemeral state functionality for a logic element.
 * Does not support retrieval of ephemeral state elements.
 */
export class EphemeralState {
    constructor() { }
    /**
     * Throws an error as ephemeral state operations are temporarily not supported.
     *
     * @param {string} label - The label of the state field.
     * @throws {Error} Always throws an error indicating ephemeral state operations
     are temporarily not supported.
     */
    async get(label) {
        ErrorUtils.throwError("Ephemeral state operations are temporarily not supported.", ErrorCode.UNSUPPORTED_OPERATION);
    }
}
//# sourceMappingURL=state.js.map