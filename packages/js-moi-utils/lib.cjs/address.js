"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = void 0;
/**
 * Checks if the given address is a valid address.
 *
 * @param {string} address - The address to validate.
 * @returns {boolean} Returns true if the address is valid, otherwise false.
 */
const isValidAddress = (address) => {
    if (typeof address !== "string")
        return false;
    if (!/^0x[0-9a-fA-F]{64}$/.test(address))
        return false;
    return true;
};
exports.isValidAddress = isValidAddress;
//# sourceMappingURL=address.js.map