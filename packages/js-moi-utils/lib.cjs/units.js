"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKmoi = exports.formatKmoi = exports.parseAmount = exports.formatAmount = exports.validateDecimals = void 0;
const js_moi_constants_1 = require("js-moi-constants");
const validateDecimals = (decimals) => {
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new Error("decimals must be a non-negative integer");
    }
    if (decimals > js_moi_constants_1.MAX_DECIMALS) {
        throw new Error(`decimals must not exceed ${js_moi_constants_1.MAX_DECIMALS}`);
    }
};
exports.validateDecimals = validateDecimals;
const validateAmountRange = (value) => {
    if (value > js_moi_constants_1.UINT256_MAX) {
        throw new Error("value overflows uint256");
    }
};
/**
 * Converts an amount in the smallest unit to a decimal string.
 * Mirrors ethers v5 formatUnits.
 */
const formatAmount = (value, decimals) => {
    (0, exports.validateDecimals)(decimals);
    if (value < 0n) {
        throw new Error("value must be non-negative");
    }
    validateAmountRange(value);
    const scale = 10n ** BigInt(decimals);
    const whole = value / scale;
    const remainder = value % scale;
    if (remainder === 0n) {
        return whole.toString();
    }
    const fraction = remainder.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole}.${fraction}`;
};
exports.formatAmount = formatAmount;
/**
 * Converts a decimal string to an amount in the smallest unit.
 * Mirrors ethers v5 parseUnits.
 */
const parseAmount = (value, decimals) => {
    (0, exports.validateDecimals)(decimals);
    if (!/^\d+(\.\d+)?$/.test(value)) {
        throw new Error("value must be a non-negative decimal string");
    }
    const [wholePart, fractionPart = ""] = value.split(".");
    if (fractionPart.length > decimals) {
        throw new Error(`value has more than ${decimals} decimal places`);
    }
    const scale = 10n ** BigInt(decimals);
    const whole = BigInt(wholePart);
    const fraction = BigInt(fractionPart.padEnd(decimals, "0"));
    const result = whole * scale + fraction;
    validateAmountRange(result);
    return result;
};
exports.parseAmount = parseAmount;
/**
 * Converts an anu amount to a decimal KMOI string.
 */
const formatKmoi = (value) => {
    return (0, exports.formatAmount)(value, js_moi_constants_1.KMOI_DECIMALS);
};
exports.formatKmoi = formatKmoi;
/**
 * Converts a decimal KMOI string to an anu amount.
 */
const parseKmoi = (value) => {
    return (0, exports.parseAmount)(value, js_moi_constants_1.KMOI_DECIMALS);
};
exports.parseKmoi = parseKmoi;
//# sourceMappingURL=units.js.map