import { AssetStandard, bytesToHex, hexToBytes, LockType, OpType, trimHexPrefix } from "js-moi-utils";
import { MAS2 } from "./mas2";
import { documentEncode } from "js-polo";
import { APPROVE_SCHEMA, BALANCEOF_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, SET_DYNAMIC_METADATA_SCHEMA, SET_STATIC_METADATA_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA } from "./mas2-schema";
import { SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "js-moi-interactions";
export class MAS2AssetLogic {
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
    static async newAsset(signer, symbol, supply, manager, enableEvents) {
        const response = await this.create(signer, symbol, supply, manager, enableEvents).send();
        const result = await response.result();
        return new MAS2AssetLogic(result[0].asset_id, signer);
    }
    static create(signer, symbol, supply, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS2,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
            logic_payload: {
                manifest: "0x",
                callsite: "Init"
            }
        };
        return new InteractionContext({
            opType: OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
        });
    }
    transfer(tokenId, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, TRANSFER_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transferFrom(tokenId, benefactor, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
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
            }
        ];
        const rawPayload = this.polorize(payload, TRANSFER_FROM_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.TRANSFERFROM,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    mint(beneficiary, amount) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, MINT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.MINT,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    mintWithMetadata(beneficiary, amount, staticMetadata) {
        const payload = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
            static_metadata: staticMetadata
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, MINT_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.MINT,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    burn(tokenId, amount) {
        const payload = {
            token_id: tokenId,
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, BURN_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.BURN,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(tokenId, beneficiary, amount, expiresAt) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
            expires_at: expiresAt
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, APPROVE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.APPROVE,
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
            }
        ];
        const rawPayload = this.polorize(payload, REVOKE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(tokenId, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
            amount: amount
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
                lock_type: LockType.MUTATE_LOCK
            }
        ];
        const rawPayload = this.polorize(payload, LOCKUP_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(tokenId, benefactor, beneficiary, amount) {
        const payload = {
            token_id: tokenId,
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
            amount: amount
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
            }
        ];
        const rawPayload = this.polorize(payload, RELEASE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    SetStaticMetadata(key, value) {
        const payload = {
            key: key,
            value: value
        };
        const rawPayload = this.polorize(payload, SET_STATIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.SETSTATICMETADATA,
                calldata: bytesToHex(rawPayload),
            },
            participants: [],
            signer: this.signer,
        });
    }
    SetDynamicMetadata(key, value) {
        const payload = {
            key: key,
            value: value
        };
        const rawPayload = this.polorize(payload, SET_DYNAMIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.SETDYNAMICMETADATA,
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
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    balanceOf(tokenId, address) {
        const payload = {
            token_id: tokenId,
            address: hexToBytes(address)
        };
        const rawPayload = this.polorize(payload, BALANCEOF_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.BALANCEOF,
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
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        });
    }
    manager() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.GETSTATICMETADATA,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId),
                callsite: MAS2.Endpoint.GETDYNAMICMETADATA,
            },
            participants: [],
            signer: this.signer,
        });
    }
}
//# sourceMappingURL=mas2-asset.js.map