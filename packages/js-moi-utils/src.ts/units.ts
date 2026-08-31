import { KMOI_DECIMALS, MAX_DECIMALS } from "js-moi-constants";

const validateDecimals = (decimals: number): void => {
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new Error("decimals must be a non-negative integer");
    }

    if (decimals > MAX_DECIMALS) {
        throw new Error(`decimals must not exceed ${MAX_DECIMALS}`);
    }
};

/**
 * Converts an amount in the smallest unit to a decimal string.
 * Mirrors ethers v5 formatUnits.
 */
export const formatAmount = (value: bigint, decimals: number): string => {
    validateDecimals(decimals);

    if (value < 0n) {
        throw new Error("value must be non-negative");
    }

    const scale = 10n ** BigInt(decimals);
    const whole = value / scale;
    const remainder = value % scale;

    if (remainder === 0n) {
        return whole.toString();
    }

    const fraction = remainder.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole}.${fraction}`;
};

/**
 * Converts a decimal string to an amount in the smallest unit.
 * Mirrors ethers v5 parseUnits.
 */
export const parseAmount = (value: string, decimals: number): bigint => {
    validateDecimals(decimals);

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

    return whole * scale + fraction;
};

/**
 * Converts an anu amount to a decimal KMOI string.
 */
export const formatKmoi = (value: bigint): string => {
    return formatAmount(value, KMOI_DECIMALS);
};

/**
 * Converts a decimal KMOI string to an anu amount.
 */
export const parseKmoi = (value: string): bigint => {
    return parseAmount(value, KMOI_DECIMALS);
};
