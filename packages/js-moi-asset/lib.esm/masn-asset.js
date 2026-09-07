import { bytesToHex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS0 } from "./mas0";
import { APPROVE_SCHEMA, BALANCEOF_SCHEMA, GET_DYNAMIC_METADATA_SCHEMA, GET_STATIC_METADATA_SCHEMA, LOCKUP_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schema";
import { documentEncode } from "js-polo";
import { KMOI_ASSET_ID, SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "js-moi-interactions";
export class MASNAssetLogic {
    signer;
    constructor(signer) {
        this.signer = signer;
    }
    polorize(payload, schema) {
        const document = documentEncode(payload, schema);
        return document.bytes();
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
                id: KMOI_ASSET_ID,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, TRANSFER_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    transferFrom(benefactor, beneficiary, amount) {
        const payload = {
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
                id: KMOI_ASSET_ID,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, TRANSFER_FROM_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.TRANSFERFROM,
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
                id: KMOI_ASSET_ID,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, APPROVE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
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
                id: KMOI_ASSET_ID,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, REVOKE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
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
                id: KMOI_ASSET_ID,
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
                asset_id: KMOI_ASSET_ID,
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
                id: KMOI_ASSET_ID,
                lock_type: LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, RELEASE_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload),
            },
            participants: participants,
            signer: this.signer,
        });
    }
    // Readonly routines
    symbol() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        });
    }
    balanceOf(id) {
        const payload = {
            address: hexToBytes(id)
        };
        const rawPayload = this.polorize(payload, BALANCEOF_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.BALANCEOF,
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
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        });
    }
    manager() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        });
    }
    Decimals() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.DECIMALS,
            },
            participants: [],
            signer: this.signer,
        });
    }
    MaxSupply() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.MAXSUPPLY,
            },
            participants: [],
            signer: this.signer,
        });
    }
    CirculatingSupply() {
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.CIRCULATINGSUPPLY,
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetStaticMetadata(key) {
        const payload = {
            key: key
        };
        const rawPayload = this.polorize(payload, GET_STATIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.GETSTATICMETADATA,
                calldata: bytesToHex(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
    GetDynamicMetadata(key) {
        const payload = {
            key: key
        };
        const rawPayload = this.polorize(payload, GET_DYNAMIC_METADATA_SCHEMA);
        return new InteractionContext({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID,
                callsite: MAS0.Endpoint.GETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload)
            },
            participants: [],
            signer: this.signer,
        });
    }
}
//# sourceMappingURL=masn-asset.js.map