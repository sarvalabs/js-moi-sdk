"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = void 0;
const isValidAddress = (address) => {
    if (typeof address !== 'string')
        return false;
    if (!/^0x[0-9a-fA-F]{64}$/.test(address))
        return false;
    return true;
};
exports.isValidAddress = isValidAddress;
