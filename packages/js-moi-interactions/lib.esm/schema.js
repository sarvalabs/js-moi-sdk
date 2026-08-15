import { bytesToHex, hexToBytes } from "js-moi-utils";
import { documentEncode } from "js-polo";
export const TRANSFER_SCHEMA = {
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
export const buildTransferPayload = (assetId, beneficiary, amount) => {
    const calldata = documentEncode({ beneficiary: hexToBytes(beneficiary), amount }, TRANSFER_SCHEMA);
    return {
        asset_id: assetId,
        callsite: "Transfer",
        calldata: ("0x" + bytesToHex(calldata.bytes())),
    };
};
//# sourceMappingURL=schema.js.map