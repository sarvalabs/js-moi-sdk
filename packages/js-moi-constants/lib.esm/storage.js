/**
 * Default KMOI amount bundled to fund a not-yet-existing logic/asset account
 * at deploy/create time (see LogicFactory.deploy() / AssetFactory.create()).
 *
 * Logic and asset accounts self-pay for their own storage on creation
 * (billed against their own balance), so a brand-new account needs funds
 * the moment it's created or the interaction reverts. This is a
 * conservative flat default, not a computed cost - the SDK cannot know the
 * exact deploy-time storage cost client-side (it depends on the compiled
 * artifact size, which only the blockchain computes). Override via
 * `RoutineOption.storageFund` for larger manifests.
 */
export const DEFAULT_STORAGE_FUND = 1_000_000;
/**
 * Minimum amount accepted for an IxStorageDeposit, mirroring the blockchain's
 * `ANUPerByte * StorageMultiplier` floor in
 * `StoragePayload.ValidateStorageDeposit` (common/ixpayload.go) - both
 * currently 1, so the floor is 1. The blockchain is
 * always the source of truth; this only lets an obviously-too-small deposit
 * fail fast client-side instead of round-tripping to the blockchain first.
 */
export const MIN_STORAGE_DEPOSIT_AMOUNT = 1;
//# sourceMappingURL=storage.js.map