"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractProvider = void 0;
/**
 * Abstract class representing a provider for interacting with the MOI protocol.
 * Provides methods for account operations, execution, and querying.
 */
class AbstractProvider {
    // Alias for "on"
    /**
     * Alias for "on" method.
     *
     * @param eventName - The name of the event.
     * @param listener - The listener function to be called when the event is emitted.
     * @returns The provider instance for chaining.
     */
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    // Alias for "off"
    /**
     * Alias for "off" method.
     *
     * @param eventName - The name of the event.
     * @param listener - The listener function to be unregistered.
     * @returns The provider instance for chaining.
     */
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
}
exports.AbstractProvider = AbstractProvider;
