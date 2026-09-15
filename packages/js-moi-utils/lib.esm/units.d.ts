export declare const validateDecimals: (decimals: number) => void;
/**
 * Converts an amount in the smallest unit to a decimal string.
 * Mirrors ethers v5 formatUnits.
 */
export declare const formatAmount: (value: bigint, decimals: number) => string;
/**
 * Converts a decimal string to an amount in the smallest unit.
 * Mirrors ethers v5 parseUnits.
 */
export declare const parseAmount: (value: string, decimals: number) => bigint;
/**
 * Converts an anu amount to a decimal KMOI string.
 */
export declare const formatKmoi: (value: bigint) => string;
/**
 * Converts a decimal KMOI string to an anu amount.
 */
export declare const parseKmoi: (value: string) => bigint;
/**
 * Converts an interaction's fuel cost (`fuel_used * fuel_price`, both anu-denominated
 * quantities) into a decimal KMOI string in one call. `InteractionReceipt` doesn't carry
 * `fuel_price` itself (only `fuel_used`), so pass the `fuel_price` the interaction was
 * originally submitted with.
 */
export declare const formatFuelFee: (fuelUsed: bigint, fuelPrice: bigint) => string;
//# sourceMappingURL=units.d.ts.map