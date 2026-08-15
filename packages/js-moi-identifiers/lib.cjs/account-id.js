"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveAssetId = exports.deriveLogicId = exports.newAccountFingerprint = void 0;
const blake2b_1 = require("@noble/hashes/blake2b");
const asset_id_1 = require("./asset-id");
const identifier_1 = require("./identifier");
const identifier_tag_1 = require("./identifier-tag");
const logic_id_1 = require("./logic-id");
/**
 * Derives the 24-byte account fingerprint the blockchain hashes into every new
 * logic/asset id: `blake2b256(BE64(sequence) || BE64(key_id) || id)[:24]`
 * (mirrors the blockchain's `common.NewAccountID`).
 */
const newAccountFingerprint = (sender) => {
    const id = new identifier_1.Identifier(sender.id).toBytes();
    const input = new Uint8Array(48);
    const view = new DataView(input.buffer);
    view.setBigUint64(0, BigInt(sender.sequence), false);
    view.setBigUint64(8, BigInt(sender.key_id), false);
    input.set(id, 16);
    return (0, blake2b_1.blake2b)(input, { dkLen: 32 }).slice(0, 24);
};
exports.newAccountFingerprint = newAccountFingerprint;
/**
 * Lays out a v0 identifier buffer: [tag(1)][flags(1)][metadata(2)][fingerprint(24)][variant(4, BE)].
 */
const layoutIdentifierV0 = (tag, flags, metadata, fingerprint, variant) => {
    const buffer = new Uint8Array(32);
    buffer[0] = tag;
    buffer[1] = flags;
    new DataView(buffer.buffer).setUint16(2, metadata, false);
    buffer.set(fingerprint, 4);
    new DataView(buffer.buffer).setUint32(28, variant, false);
    return buffer;
};
/**
 * Derives the LogicID a fresh `IxLogicDeploy` from `sender` will produce,
 * before the deploy exists on-chain. Mirrors the blockchain's
 * `identifiers.GenerateLogicIDv0(NewAccountID(sender), 0)`.
 *
 * Flags are always 0: the blockchain's `LogicPayload.Flags()` is
 * currently a stub that always returns an empty set (as of the
 * storage-cost feature work) - update this if/when the blockchain starts
 * setting deploy-time logic flags.
 */
const deriveLogicId = (sender) => {
    const fingerprint = (0, exports.newAccountFingerprint)(sender);
    return new logic_id_1.LogicId(layoutIdentifierV0(identifier_tag_1.LogicTagV0.value, 0x00, 0, fingerprint, 0));
};
exports.deriveLogicId = deriveLogicId;
/**
 * Derives the AssetID a fresh `IxAssetCreate` from `sender` will produce,
 * before the create exists on-chain. Mirrors the blockchain's
 * `identifiers.GenerateAssetIDv0(NewAccountID(sender), 0, standard)`.
 *
 * Flags are always `AssetLogical | AssetStateful` (0x03): the blockchain's
 * `AssetCreatePayload.Flags()` returns that pair unconditionally,
 * regardless of the create payload's contents.
 */
const deriveAssetId = (sender, standard) => {
    const fingerprint = (0, exports.newAccountFingerprint)(sender);
    return new asset_id_1.AssetId(layoutIdentifierV0(identifier_tag_1.AssetTagV0.value, 0x03, standard, fingerprint, 0));
};
exports.deriveAssetId = deriveAssetId;
//# sourceMappingURL=account-id.js.map