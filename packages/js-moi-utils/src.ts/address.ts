import type { Address } from "./hex";

/**
 * Checks if the given address is a valid address.
 *
 * @param {string} address - The address to validate.
 * @returns {boolean} Returns true if the address is valid, otherwise false.
 */
export const isValidAddress = (address: unknown): address is Address => {
    if (typeof address !== "string") return false;
    if (!/^0x[0-9a-fA-F]{64}$/.test(address)) return false;
    return true;
};
