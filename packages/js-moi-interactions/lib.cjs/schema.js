"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTransferPayload = exports.TRANSFER_SCHEMA = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
exports.TRANSFER_SCHEMA = {
    kind: "struct",
    fields: {
        beneficiary: {
            kind: "bytes"
        },
        amount: {
            kind: "integer"
        }
    }
};
/**
 * Builds an AssetActionPayload that transfers `amount` of `assetId` to
 * `beneficiary` - the same "Transfer" calldata shape AccountInherit and
 * ParticipantCreate already build inline, pulled out so other builders
 * (e.g. bundling a funding transfer alongside a deploy/create) can reuse it.
 */
const buildTransferPayload = (assetId, beneficiary, amount) => {
    const calldata = (0, js_polo_1.documentEncode)({ beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary), amount }, exports.TRANSFER_SCHEMA);
    return {
        asset_id: assetId,
        callsite: "Transfer",
        calldata: ("0x" + (0, js_moi_utils_1.bytesToHex)(calldata.bytes())),
    };
};
exports.buildTransferPayload = buildTransferPayload;
//# sourceMappingURL=schema.js.map