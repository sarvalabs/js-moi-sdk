import { bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS0 } from "./mas0";
import { APPROVE_SCHEMA, BALANCEOF_SCHEMA, GET_DYNAMIC_METADATA_SCHEMA, GET_STATIC_METADATA_SCHEMA, LOCKUP_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schema";
import { documentEncode, Schema } from "js-polo";
import { Signer } from "js-moi-signer";
import { IxParticipant } from "js-moi-providers";
import { KMOI_ASSET_ID, SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "js-moi-interactions";

export class MASNAssetLogic {
    signer: Signer

    constructor(signer: Signer) {
        this.signer = signer;
    }

    private polorize<T extends MAS0.OperationPayload>(payload: T, schema: Schema): Uint8Array {
        const document = documentEncode(payload, schema)

        return document.bytes()
    }

    public transfer(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Transfer = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        }

        const participants: IxParticipant[] = [
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: KMOI_ASSET_ID as Hex,
                lock_type: LockType.NO_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.Transfer>(payload, TRANSFER_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public transferFrom(benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.TransferFrom = {
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        }

        const participants: IxParticipant[] = [
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: benefactor as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: KMOI_ASSET_ID as Hex,
                lock_type: LockType.NO_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.TransferFrom>(payload, TRANSFER_FROM_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.TRANSFERFROM,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public approve(beneficiary: string, amount: number | bigint, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Approve = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
            expires_at: expiresAt
        }

        const participants: IxParticipant[] = [
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: KMOI_ASSET_ID as Hex,
                lock_type: LockType.NO_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.Approve>(payload, APPROVE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.APPROVE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public revoke(beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Revoke = {
            beneficiary: hexToBytes(beneficiary),
        }

        const participants: IxParticipant[] = [
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: KMOI_ASSET_ID as Hex,
                lock_type: LockType.NO_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.Revoke>(payload, REVOKE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public lockup(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Lockup = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount
        }

        const participants: IxParticipant[] = [
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: KMOI_ASSET_ID as Hex,
                lock_type: LockType.NO_LOCK,
            },
            {
                id: SARGA_ADDRESS as Hex,
                lock_type: LockType.MUTATE_LOCK
            }
        ]

        const rawPayload = this.polorize<MAS0.Lockup>(payload, LOCKUP_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public release(benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Release = {
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
            amount: amount
        }

        const participants: IxParticipant[] = [
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: benefactor as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: KMOI_ASSET_ID as Hex,
                lock_type: LockType.NO_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.Release>(payload, RELEASE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        });
    }

    // Readonly routines

    public symbol() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public balanceOf(id: string) {
        const payload: MAS0.BalanceOf = {
            address: hexToBytes(id)
        }

        const rawPayload = this.polorize<MAS0.BalanceOf>(payload, BALANCEOF_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.BALANCEOF,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public creator() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public manager() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public Decimals() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.DECIMALS,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public MaxSupply() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.MAXSUPPLY,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public CirculatingSupply() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.CIRCULATINGSUPPLY,
            },
            participants: [],
            signer: this.signer,
        })
    }

    public GetStaticMetadata(key: string) {
        const payload: MAS0.GetStaticMetadata = {
            key: key
        }

        const rawPayload = this.polorize<MAS0.GetStaticMetadata>(payload, GET_STATIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.GETSTATICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex
            },
            participants: [],
            signer: this.signer,
        })
    }

    public GetDynamicMetadata(key: string) {
        const payload: MAS0.GetDynamicMetadata = {
            key: key
        }

        const rawPayload = this.polorize<MAS0.GetDynamicMetadata>(payload, GET_DYNAMIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: KMOI_ASSET_ID as Hex,
                callsite: MAS0.Endpoint.GETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex
            },
            participants: [],
            signer: this.signer,
        })
    }
}
