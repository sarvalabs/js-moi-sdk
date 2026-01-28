import { AssetCreationResult, AssetStandard, bytesToHex, Hex, hexToBytes, LockType, OpType, trimHexPrefix } from "js-moi-utils";
import { MAS2 } from "./mas2";
import { documentEncode, Schema } from "js-polo";
import { APPROVE_SCHEMA, BALANCEOF_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, MINT_WITH_METADATA_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, SET_DYNAMIC_METADATA_SCHEMA, SET_STATIC_METADATA_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA } from "./mas2-schema";
import { Signer } from "js-moi-signer";
import { AssetCreatePayload, IxParticipant } from "js-moi-providers";
import { SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "js-moi-interactions";

export class MAS2AssetLogic {
    assetId: string
    signer: Signer

    constructor(assetId: string, signer: Signer) {
        this.assetId = assetId;
        this.signer = signer;
    }

    private polorize<T extends MAS2.OperationPayload>(payload: T, schema: Schema): Uint8Array {
        const document = documentEncode(payload, schema)

        return document.bytes()
    }

    static async newAsset(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean, 
    ): Promise<MAS2AssetLogic> {
        const response = await this.create(signer, symbol, supply, manager, enableEvents).send()

        const result:AssetCreationResult = await response.result()

        return new MAS2AssetLogic(result[0].asset_id, signer)
    }

    static create(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean,
    ): InteractionContext<OpType.ASSET_CREATE> {
        const payload: AssetCreatePayload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS2,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager as Hex,
            logic_payload: {
                manifest: "0x",
                callsite: "Init"
            }
        }

        return new InteractionContext<OpType.ASSET_CREATE>({
              opType: OpType.ASSET_CREATE,
              payload: payload,
              participants: [],
              signer: signer,
        })
    }

    public transfer(tokenId: number | bigint, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Transfer = {
            token_id: tokenId,
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

        const rawPayload = this.polorize<MAS2.Transfer>(payload, TRANSFER_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public transferFrom(tokenId: number | bigint, benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.TransferFrom = {
            token_id: tokenId,
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

        const rawPayload = this.polorize<MAS2.Transfer>(payload, TRANSFER_FROM_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.TRANSFERFROM,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public mint(beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Mint = {
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

        const rawPayload = this.polorize<MAS2.Mint>(payload, MINT_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
              opType: OpType.ASSET_INVOKE,
              payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.MINT,
                calldata: bytesToHex(rawPayload) as Hex,
              },
              participants: participants,
              signer: this.signer,
        })
    }

    public mintWithMetadata(beneficiary: string, amount: number | bigint, staticMetadata: Record<string, Uint8Array>): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.MintWithMetadata = {
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

        const rawPayload = this.polorize<MAS2.MintWithMetadata>(payload, MINT_WITH_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
              opType: OpType.ASSET_INVOKE,
              payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.MINT,
                calldata: bytesToHex(rawPayload) as Hex,
              },
              participants: participants,
              signer: this.signer,
        })
    }

    public burn(tokenId: number | bigint, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Burn = {
            token_id: tokenId,
            amount: amount,
        }

        const participants: IxParticipant[] = [
            {
                id: this.assetId as Hex,
                lock_type: LockType.MUTATE_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS2.Burn>(payload, BURN_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.BURN,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public approve(tokenId: number | bigint, beneficiary: string, amount: number | bigint, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Approve = {
            token_id: tokenId,
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

        const rawPayload = this.polorize<MAS2.Approve>(payload, APPROVE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.APPROVE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public revoke(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Revoke = {
            token_id: tokenId,
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

        const rawPayload = this.polorize<MAS2.Revoke>(payload, REVOKE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public lockup(tokenId: number | bigint, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Lockup = {
            token_id: tokenId,
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

        const rawPayload = this.polorize<MAS2.Lockup>(payload, LOCKUP_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public release(tokenId: number | bigint, benefactor: string, beneficiary: string, amount: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS2.Release = {
            token_id: tokenId,
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

        const rawPayload = this.polorize<MAS2.Release>(payload, RELEASE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        });
    }

    public SetStaticMetadata(key: string, value: Uint8Array) {
        const payload: MAS2.SetStaticMetadata = {
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS2.SetStaticMetadata>(payload, SET_STATIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.SETSTATICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public SetDynamicMetadata(key: string, value: Uint8Array) {
        const payload: MAS2.SetDynamicMetadata = {
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS2.SetDynamicMetadata>(payload, SET_DYNAMIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.SETDYNAMICMETADATA,
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
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        }) 
    }

    public balanceOf(tokenId: number | bigint, address: string) {
        const payload: MAS2.BalanceOf = {
            token_id: tokenId,
            address: hexToBytes(address)
        }

        const rawPayload = this.polorize<MAS2.BalanceOf>(payload, BALANCEOF_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.BALANCEOF,
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
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.CREATOR,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public manager() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetStaticMetadata() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.GETSTATICMETADATA,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetDynamicMetadata() {
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS2.Endpoint.GETDYNAMICMETADATA,
            },
            participants: [],
            signer: this.signer,
        })  
    }
}
