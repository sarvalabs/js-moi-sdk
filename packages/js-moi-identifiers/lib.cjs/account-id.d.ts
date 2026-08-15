import { AssetId } from "./asset-id";
import { Identifier } from "./identifier";
import { LogicId } from "./logic-id";
import type { Hex } from "./utils";
/**
 * The subset of an interaction's sender fields that determine the account
 * fingerprint a new logic/asset id is derived from. Must be the exact
 * sender (in particular, the exact sequence) that will sign/send the
 * interaction - the same account at a different sequence produces a
 * different, unrelated fingerprint.
 */
export interface AccountIdSender {
    id: Hex | Uint8Array | Identifier;
    sequence: number | bigint;
    key_id: number | bigint;
}
/**
 * Derives the 24-byte account fingerprint go-moi hashes into every new
 * logic/asset id: `blake2b256(BE64(sequence) || BE64(key_id) || id)[:24]`
 * (go-moi: `common.NewAccountID`).
 */
export declare const newAccountFingerprint: (sender: AccountIdSender) => Uint8Array;
/**
 * Predicts the LogicID a fresh `IxLogicDeploy` from `sender` will produce,
 * before the deploy exists on-chain. Mirrors go-moi's
 * `identifiers.GenerateLogicIDv0(NewAccountID(sender), 0)`.
 *
 * Flags are always 0: go-moi's `LogicPayload.Flags()` is currently a stub
 * that always returns an empty set (as of go-moi `feature/storage-cost`) -
 * update this if/when go-moi starts setting deploy-time logic flags.
 */
export declare const predictLogicId: (sender: AccountIdSender) => LogicId;
/**
 * Predicts the AssetID a fresh `IxAssetCreate` from `sender` will produce,
 * before the create exists on-chain. Mirrors go-moi's
 * `identifiers.GenerateAssetIDv0(NewAccountID(sender), 0, standard)`.
 *
 * Flags are always `AssetLogical | AssetStateful` (0x03): go-moi's
 * `AssetCreatePayload.Flags()` returns that pair unconditionally, regardless
 * of the create payload's contents.
 */
export declare const predictAssetId: (sender: AccountIdSender, standard: number) => AssetId;
//# sourceMappingURL=account-id.d.ts.map