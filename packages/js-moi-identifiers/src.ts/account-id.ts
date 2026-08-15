import { blake2b } from "@noble/hashes/blake2b";
import { AssetId } from "./asset-id";
import { Identifier } from "./identifier";
import { AssetTagV0, LogicTagV0 } from "./identifier-tag";
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
export const newAccountFingerprint = (sender: AccountIdSender): Uint8Array => {
    const id = new Identifier(sender.id).toBytes();

    const input = new Uint8Array(48);
    const view = new DataView(input.buffer);
    view.setBigUint64(0, BigInt(sender.sequence), false);
    view.setBigUint64(8, BigInt(sender.key_id), false);
    input.set(id, 16);

    return blake2b(input, { dkLen: 32 }).slice(0, 24);
};

/**
 * Lays out a v0 identifier buffer: [tag(1)][flags(1)][metadata(2)][fingerprint(24)][variant(4, BE)].
 */
const layoutIdentifierV0 = (tag: number, flags: number, metadata: number, fingerprint: Uint8Array, variant: number): Uint8Array => {
    const buffer = new Uint8Array(32);
    buffer[0] = tag;
    buffer[1] = flags;
    new DataView(buffer.buffer).setUint16(2, metadata, false);
    buffer.set(fingerprint, 4);
    new DataView(buffer.buffer).setUint32(28, variant, false);

    return buffer;
};

/**
 * Predicts the LogicID a fresh `IxLogicDeploy` from `sender` will produce,
 * before the deploy exists on-chain. Mirrors go-moi's
 * `identifiers.GenerateLogicIDv0(NewAccountID(sender), 0)`.
 *
 * Flags are always 0: go-moi's `LogicPayload.Flags()` is currently a stub
 * that always returns an empty set (as of go-moi `feature/storage-cost`) -
 * update this if/when go-moi starts setting deploy-time logic flags.
 */
export const predictLogicId = (sender: AccountIdSender): LogicId => {
    const fingerprint = newAccountFingerprint(sender);

    return new LogicId(layoutIdentifierV0(LogicTagV0.value, 0x00, 0, fingerprint, 0));
};

/**
 * Predicts the AssetID a fresh `IxAssetCreate` from `sender` will produce,
 * before the create exists on-chain. Mirrors go-moi's
 * `identifiers.GenerateAssetIDv0(NewAccountID(sender), 0, standard)`.
 *
 * Flags are always `AssetLogical | AssetStateful` (0x03): go-moi's
 * `AssetCreatePayload.Flags()` returns that pair unconditionally, regardless
 * of the create payload's contents.
 */
export const predictAssetId = (sender: AccountIdSender, standard: number): AssetId => {
    const fingerprint = newAccountFingerprint(sender);

    return new AssetId(layoutIdentifierV0(AssetTagV0.value, 0x03, standard, fingerprint, 0));
};
