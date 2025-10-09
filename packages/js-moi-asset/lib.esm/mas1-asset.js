import { AssetStandard, bytesToHex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS1 } from "./mas1";
import { documentEncode } from "js-polo";
import { MINT_NFT_SCHEMA, BURN_NFT_SCHEMA, TRANSFER_NFT_SCHEMA, APPROVE_NFT_SCHEMA, SET_APPROVAL_FOR_ALL_SCHEMA } from "./mas1-schemas";
import { InteractionContext } from "js-moi-wallet";
export class MAS1AssetLogic {
    assetId;
    signer;
    constructor(assetId, signer) {
        this.assetId = assetId;
        this.signer = signer;
    }
    polorize(payload, schema) {
        const document = documentEncode(payload, schema);
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
            standard: AssetStandard.MAS1,
            dimension: 1, // NFT-like (unique tokens) — adjust if your system expects a different value
            enable_events: enableEvents,
            manager: manager,
        };
        return new InteractionContext({
            opType: OpType.ASSET_CREATE,
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
            beneficiary: hexToBytes(beneficiary),
            token_id: tokenId,
            // Optional metadata blob for NFT (if MAS1 supports it).
            metadata: metadata ?? new Uint8Array(0),
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, MINT_NFT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.MINT,
                calldata: bytesToHex(rawPayload),
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
                lock_type: LockType.MUTATE_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, BURN_NFT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.BURN,
                calldata: bytesToHex(rawPayload),
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
            from: hexToBytes(from),
            to: hexToBytes(to),
            token_id: tokenId,
        };
        const participants = [
            {
                id: from,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: to,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, TRANSFER_NFT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload),
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
            approved: hexToBytes(approved),
            token_id: tokenId,
        };
        const participants = [
            {
                id: approved,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, APPROVE_NFT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.APPROVE,
                calldata: bytesToHex(rawPayload),
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
            operator: hexToBytes(operator),
            approved: approved,
        };
        const participants = [
            {
                id: operator,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, SET_APPROVAL_FOR_ALL_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SET_APPROVAL_FOR_ALL,
                calldata: bytesToHex(rawPayload),
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
//# sourceMappingURL=mas1-asset.js.map