import { AssetCreationResult, AssetStandard, bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS0 } from "./mas0";
import { documentEncode, Schema } from "js-polo";
import { APPROVE_SCHEMA, BALANCEOF_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, SET_DYNAMIC_METADATA_SCHEMA, SET_STATIC_METADATA_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schemas";
import { Signer } from "js-moi-signer";
import { AssetCreatePayload, IxParticipant } from "js-moi-providers";
import { SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "js-moi-interactions";

export class MAS0AssetLogic {
    assetId: string
    signer: Signer

    constructor(assetId: string, signer: Signer) {
        this.assetId = assetId;
        this.signer = signer;
    }

    private polorize<T extends MAS0.OperationPayload>(payload: T, schema: Schema): Uint8Array {
        const document = documentEncode(payload, schema)

        return document.bytes()
    }

    static async newAsset(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean, 
    ): Promise<MAS0AssetLogic> {
        const response = await this.create(signer, symbol, supply, manager, enableEvents).send()

        const result:AssetCreationResult = await response.result()

        return new MAS0AssetLogic(result[0].asset_id, signer)
    }

    static create(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean,
    ): InteractionContext<OpType.ASSET_CREATE> {
        const payload: AssetCreatePayload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager as Hex,
        }

        return new InteractionContext<OpType.ASSET_CREATE>({
              opType: OpType.ASSET_CREATE,
              payload: payload,
              participants: [],
              signer: signer,
        })
    }

    public mint(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Mint = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
        }

        const participants: IxParticipant[] = [
            {
                id: this.assetId as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.Mint>(payload, MINT_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
              opType: OpType.ASSET_INVOKE,
              payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.MINT,
                calldata: bytesToHex(rawPayload) as Hex,
              },
              participants: participants,
              signer: this.signer,
        })
    }

    public mintWithMetadata(beneficiary: string, amount: number | bigint, staticMetadata: Record<string, Uint8Array>): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.MintWithMetadata = {
            beneficiary: hexToBytes(beneficiary),
            amount: amount,
            static_metadata: staticMetadata
        }

        const participants: IxParticipant[] = [
            {
                id: this.assetId as Hex,
                lock_type: LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary as Hex,
                lock_type: LockType.MUTATE_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.MintWithMetadata>(payload, MINT_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
              opType: OpType.ASSET_INVOKE,
              payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.MINT,
                calldata: bytesToHex(rawPayload) as Hex,
              },
              participants: participants,
              signer: this.signer,
        })
    }

    public burn(amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS0.Burn = {
            amount: amount,
        }

        const participants: IxParticipant[] = [
            {
                id: this.assetId as Hex,
                lock_type: LockType.MUTATE_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS0.Burn>(payload, BURN_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.BURN,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
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
                id: this.assetId as Hex,
                lock_type: LockType.NO_LOCK, 
            }
        ]

        const rawPayload = this.polorize<MAS0.Transfer>(payload, TRANSFER_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
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
                id: this.assetId as Hex,
                lock_type: LockType.NO_LOCK, 
            }
        ]

        const rawPayload = this.polorize<MAS0.Transfer>(payload, TRANSFER_FROM_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
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
                id: this.assetId as Hex,
                lock_type: LockType.NO_LOCK, 
            }
        ]

        const rawPayload = this.polorize<MAS0.Approve>(payload, APPROVE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
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
                id: this.assetId as Hex,
                lock_type: LockType.NO_LOCK, 
            }
        ]

        const rawPayload = this.polorize<MAS0.Revoke>(payload, REVOKE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
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
                id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
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
                id: this.assetId as Hex,
                lock_type: LockType.NO_LOCK, 
            }
        ]

        const rawPayload = this.polorize<MAS0.Release>(payload, RELEASE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        });
    }

    public SetStaticMetadata(key: string, value: Uint8Array) {
        const payload: MAS0.SetStaticMetadata = {
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS0.SetStaticMetadata>(payload, SET_STATIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.SETSTATICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public SetDynamicMetadata(key: string, value: Uint8Array) {
        const payload: MAS0.SetDynamicMetadata = {
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS0.SetDynamicMetadata>(payload, SET_DYNAMIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.SETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    // Readonly routines

    public symbol() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
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
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.CIRCULATINGSUPPLY,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetStaticMetadata() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.GETSTATICMETADATA,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetDynamicMetadata() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: this.assetId as Hex,
                callsite: MAS0.Endpoint.GETDYNAMICMETADATA,
            },
            participants: [],
            signer: this.signer,
        })  
    }
}
