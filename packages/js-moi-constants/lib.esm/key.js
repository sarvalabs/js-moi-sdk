/**
 * Minimum accepted weight for a registered key, mirroring the blockchain's
 * `MinWeight` (common/account.go) - the total weight of an identity's valid
 * signatures must reach this floor. The blockchain rejects anything lower
 * with "weight cannot be less than 1000"; this only lets that mistake fail
 * fast client-side instead of round-tripping to the blockchain first.
 */
export const MIN_KEY_WEIGHT = 1000;
//# sourceMappingURL=key.js.map