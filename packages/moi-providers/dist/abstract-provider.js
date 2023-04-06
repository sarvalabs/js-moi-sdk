"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractProvider = void 0;
class AbstractProvider {
    // Alias for "on"
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    // Alias for "off"
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
}
exports.AbstractProvider = AbstractProvider;
