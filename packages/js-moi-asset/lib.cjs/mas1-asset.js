"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAS1AssetLogic = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const mas1_1 = require("./mas1");
const js_polo_1 = require("js-polo");
const mas1_schemas_1 = require("./mas1-schemas");
const js_moi_wallet_1 = require("js-moi-wallet");
class MAS1AssetLogic {
    assetId;
    signer;
    constructor(assetId, signer) {
        this.assetId = assetId;
        this.signer = signer;
    }
    polorize(payload, schema) {
        const document = (0, js_polo_1.documentEncode)(payload, schema);
        return document.bytes();
    }
    static async newAsset(signer, symbol, maxTokens, manager, enableEvents) {
        const response = await this.create(signer, symbol, maxTokens, manager, enableEvents).send();
        const result = await response.result();
        return new MAS1AssetLogic(result[0].asset_id, signer);
    }
    static create(signer, symbol, maxTokens, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: maxTokens,
            standard: js_moi_utils_1.AssetStandard.MAS1,
            dimension: 1, // NFT-like (unique tokens) — adjust if your system expects a different value
            enable_events: enableEvents,
            manager: manager,
        };
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
        });
    }
    /**
     * Mint a new NFT with a specific token_id to beneficiary.
     * tokenId should be unique (number | bigint).
     */
    mint(beneficiary, tokenId, metadata) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            token_id: tokenId,
            // Optional metadata blob for NFT (if MAS1 supports it).
            metadata: metadata ?? new Uint8Array(0),
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, mas1_schemas_1.MINT_NFT_SCHEMA);
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas1_1.MAS1.Endpoint.MINT,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    /**
     * Burn (destroy) a single NFT by token id.
     */
    burn(tokenId) {
        const payload = {
            token_id: tokenId,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, mas1_schemas_1.BURN_NFT_SCHEMA);
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas1_1.MAS1.Endpoint.BURN,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    /**
     * Transfer a token from `from` to `to`. For convenience this method assumes caller has rights.
     */
    transfer(from, to, tokenId) {
        const payload = {
            from: (0, js_moi_utils_1.hexToBytes)(from),
            to: (0, js_moi_utils_1.hexToBytes)(to),
            token_id: tokenId,
        };
        const participants = [
            {
                id: from,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: to,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, mas1_schemas_1.TRANSFER_NFT_SCHEMA);
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas1_1.MAS1.Endpoint.TRANSFER,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    /**
     * Approve a single address to manage the given tokenId.
     */
    approve(approved, tokenId) {
        const payload = {
            approved: (0, js_moi_utils_1.hexToBytes)(approved),
            token_id: tokenId,
        };
        const participants = [
            {
                id: approved,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, mas1_schemas_1.APPROVE_NFT_SCHEMA);
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas1_1.MAS1.Endpoint.APPROVE,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    /**
     * Set or unset operator approval (approve all) for an operator address.
     */
    setApprovalForAll(operator, approved) {
        const payload = {
            operator: (0, js_moi_utils_1.hexToBytes)(operator),
            approved: approved,
        };
        const participants = [
            {
                id: operator,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, mas1_schemas_1.SET_APPROVAL_FOR_ALL_SCHEMA);
        return new js_moi_wallet_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: mas1_1.MAS1.Endpoint.SET_APPROVAL_FOR_ALL,
                calldata: (0, js_moi_utils_1.bytesToHex)(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    /**
     * Convenience: revoke approval for a specific token (set approved to zero / null).
     */
    revokeApproval(tokenId) {
        // Many ERC721 implementations approve a zero address to revoke. Adjust if your MAS1 has an explicit revoke call.
        return this.approve("0x0000000000000000000000000000000000000000", tokenId);
    }
}
exports.MAS1AssetLogic = MAS1AssetLogic;
//# sourceMappingURL=mas1-asset.js.map