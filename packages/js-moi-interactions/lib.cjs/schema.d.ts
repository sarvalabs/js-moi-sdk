import { AssetActionPayload } from "js-moi-providers";
import { Hex } from "js-moi-utils";
export declare const TRANSFER_SCHEMA: {
    kind: string;
    fields: {
        beneficiary: {
            kind: string;
        };
        amount: {
            kind: string;
        };
    };
};
/**
 * Builds an AssetActionPayload that transfers `amount` of `assetId` to
 * `beneficiary` - the same "Transfer" calldata shape AccountInherit and
 * ParticipantCreate already build inline, pulled out so other builders
 * (e.g. bundling a funding transfer alongside a deploy/create) can reuse it.
 */
export declare const buildTransferPayload: (assetId: Hex, beneficiary: Hex, amount: number | bigint) => AssetActionPayload;
//# sourceMappingURL=schema.d.ts.map