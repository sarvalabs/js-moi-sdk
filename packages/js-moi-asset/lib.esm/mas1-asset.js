import { AssetStandard, bytesToHex, hexToBytes, LockType, OpType, parseAmount, validateDecimals, } from "js-moi-utils";
import { MAS1 } from "./mas1";
import { documentEncode } from "js-polo";
import { DEFAULT_STORAGE_FUND, KMOI_ASSET_ID, SARGA_ADDRESS, } from "js-moi-constants";
import { buildTransferPayload, InteractionContext } from "js-moi-interactions";
import { deriveAssetId } from "js-moi-identifiers";
import { APPROVE_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, SET_DYNAMIC_METADATA_SCHEMA, SET_STATIC_METADATA_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA, GET_DYNAMIC_METADATA_SCHEMA, GET_DYNAMIC_TOKEN_METADATA_SCHEMA, GET_STATIC_METADATA_SCHEMA, GET_STATIC_TOKEN_METADATA_SCHEMA, IS_OWNER_SCHEMA, SET_DYNAMIC_TOKEN_METADATA_SCHEMA, SET_STATIC_TOKEN_METADATA_SCHEMA, MINT_WITH_METADATA_SCHEMA, } from "./mas1-schema";
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
    static async newAsset(signer, symbol, manager, enableEvents, option, decimals) {
        const response = await this.create(signer, symbol, manager, enableEvents, option, decimals).send();
        const results = await response.result();
        return new MAS1AssetLogic(results[0].asset_id, signer);
    }
    static create(signer, symbol, manager, enableEvents, option, decimals) {
        const maxSupply = parseAmount("1", decimals ?? 0);
        console.log("Max supply", maxSupply);
        const payload = {
            symbol: symbol,
            max_supply: maxSupply,
            standard: AssetStandard.MAS1,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
            logic_payload: {
                manifest: "0x",
                callsite: "Init",
            },
        };
        if (decimals !== undefined) {
            validateDecimals(decimals);
            payload.decimals = decimals;
        }
        return new InteractionContext({
            opType: OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
            // A newly created asset self-pays for its own storage the moment it's
            // created, and a fresh account holds no KMOI - bundle a funding transfer
            // to the derived asset id, same as AssetFactory.create(). See
            // deriveAssetId's docs for why this must mirror the blockchain's id derivation
            // exactly - a wrong prediction sends funds to the wrong account.
            fundingOperations: (sender) => {
                const assetId = deriveAssetId(sender, payload.standard);
                const transfer = buildTransferPayload(KMOI_ASSET_ID, assetId.toHex(), option?.storageFund ?? DEFAULT_STORAGE_FUND);
                return [{ type: OpType.ASSET_INVOKE, payload: transfer }];
            },
        });
    }
    mint(beneficiary) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
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
        const rawPayload = this.polorize(payload, MINT_SCHEMA);
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
    mintWithMetadata(beneficiary, staticMetadata) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            static_metadata: new Map(Object.entries(staticMetadata)),
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
        const rawPayload = this.polorize(payload, MINT_WITH_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.MINTWITHMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
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
        const rawPayload = this.polorize(payload, BURN_SCHEMA);
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
    transfer(tokenId, beneficiary) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, TRANSFER_SCHEMA);
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
    transferFrom(tokenId, benefactor, beneficiary) {
        const payload = {
            token_id: tokenId,
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, TRANSFER_FROM_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.TRANSFERFROM,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(tokenId, beneficiary, expiresAt) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
            expires_at: expiresAt,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, APPROVE_SCHEMA);
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
    revoke(tokenId, beneficiary) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, REVOKE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(tokenId, beneficiary) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
            {
                id: SARGA_ADDRESS,
                lock_type: LockType.MUTATE_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, LOCKUP_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(tokenId, benefactor, beneficiary) {
        const payload = {
            token_id: tokenId,
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            },
        ];
        const rawPayload = this.polorize(payload, RELEASE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    SetStaticMetadata(key, value) {
        const payload = {
            key: key,
            value: value,
        };
        const rawPayload = this.polorize(payload, SET_STATIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SETSTATICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetDynamicMetadata(key, value) {
        const payload = {
            key: key,
            value: value,
        };
        const rawPayload = this.polorize(payload, SET_DYNAMIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetStaticTokenMetadata(tokenId, key, value) {
        const payload = {
            token_id: tokenId,
            key: key,
            value: value,
        };
        const rawPayload = this.polorize(payload, SET_STATIC_TOKEN_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SETSTATICTOKENMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetDynamicTokenMetadata(tokenId, key, value) {
        const payload = {
            token_id: tokenId,
            key: key,
            value: value,
        };
        const rawPayload = this.polorize(payload, SET_DYNAMIC_TOKEN_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SETDYNAMICTOKENMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    // Readonly routines
    symbol() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    isOwner(tokenId, address) {
        const payload = {
            token_id: tokenId,
            address: address,
        };
        const rawPayload = this.polorize(payload, IS_OWNER_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.SYMBOL,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    creator() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        });
    }
    manager() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata(key) {
        const payload = {
            key: key,
        };
        const rawPayload = this.polorize(payload, GET_STATIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.GETSTATICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata(key) {
        const payload = {
            key: key,
        };
        const rawPayload = this.polorize(payload, GET_DYNAMIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.GETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticTokenMetadata(tokenId, key) {
        const payload = {
            token_id: tokenId,
            key: key,
        };
        const rawPayload = this.polorize(payload, GET_STATIC_TOKEN_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.GETSTATICTOKENMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicTokenMetadata(tokenId, key) {
        const payload = {
            token_id: tokenId,
            key: key,
        };
        const rawPayload = this.polorize(payload, GET_DYNAMIC_TOKEN_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId,
                callsite: MAS1.Endpoint.GETDYNAMICTOKENMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
}
//# sourceMappingURL=mas1-asset.js.map