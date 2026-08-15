/**
 * Default KMOI amount bundled to fund a not-yet-existing logic/asset account
 * at deploy/create time (see LogicFactory.deploy() / AssetFactory.create()).
 *
 * Logic and asset accounts self-pay for their own storage on creation
 * (billed against their own balance), so a brand-new account needs funds
 * the moment it's created or the interaction reverts. This is a
 * conservative flat default, not a computed cost - the SDK cannot know the
 * exact deploy-time storage cost client-side (it depends on the compiled
 * artifact size, which only the node computes). Override via
 * `RoutineOption.fundNewAccount` for larger manifests.
 */
export declare const DEFAULT_NEW_ACCOUNT_FUNDING = 1000000;
//# sourceMappingURL=storage.d.ts.map