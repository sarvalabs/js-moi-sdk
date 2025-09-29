import { AssetStandard, bytesToHex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS0 } from "./mas0";
import { documentEncode } from "js-polo";
import { APPROVE_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schemas";
import { SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "./interaction";
export class MAS0AssetLogic {
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
        return new MAS0AssetLogic(result[0].asset_id, signer);
    }
    static create(signer, symbol, supply, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS0,
            dimension: 0,
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.MINT,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    burn(amount) {
        const payload = {
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.BURN,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transfer(beneficiary, amount) {
        const payload = {
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    approve(beneficiary, amount, expiresAt) {
        const payload = {
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.APPROVE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    revoke(beneficiary) {
        const payload = {
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    lockup(beneficiary, amount) {
        const payload = {
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    release(benefactor, beneficiary, amount) {
        const payload = {
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
                asset_id: this.assetId,
                callsite: MAS0.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
}
//# sourceMappingURL=mas0-asset.js.map