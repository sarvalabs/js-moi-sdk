import { AssetCreationResult, AssetStandard, bytesToHex, Hex, hexToBytes, LockType, OpType, trimHexPrefix } from "js-moi-utils";
import { MAS1 } from "./mas1";
import { documentEncode, Schema } from "js-polo";
import { Signer } from "js-moi-signer";
import { AssetCreatePayload, IxParticipant } from "js-moi-providers";
import { SARGA_ADDRESS } from "js-moi-constants";
import { InteractionContext } from "js-moi-interactions";
import { APPROVE_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, SET_DYNAMIC_METADATA_SCHEMA, SET_STATIC_METADATA_SCHEMA, TRANSFER_FROM_SCHEMA, TRANSFER_SCHEMA, GET_DYNAMIC_METADATA_SCHEMA, GET_DYNAMIC_TOKEN_METADATA_SCHEMA, GET_STATIC_METADATA_SCHEMA, GET_STATIC_TOKEN_METADATA_SCHEMA, IS_OWNER_SCHEMA, SET_DYNAMIC_TOKEN_METADATA_SCHEMA, SET_STATIC_TOKEN_METADATA_SCHEMA } from "./mas1-schema";

export class MAS1AssetLogic {
    assetId: string
    signer: Signer

    constructor(assetId: string, signer: Signer) {
        this.assetId = assetId;
        this.signer = signer;
    }

    private polorize<T extends MAS1.OperationPayload>(payload: T, schema: Schema): Uint8Array {
        const document = documentEncode(payload, schema)

        return document.bytes()
    }

    static async newAsset(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean, 
    ): Promise<MAS1AssetLogic> {
        const response = await this.create(signer, symbol, supply, manager, enableEvents).send()

        const result:AssetCreationResult = await response.result()

        return new MAS1AssetLogic(result[0].asset_id, signer)
    }

    static create(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean,
    ): InteractionContext<OpType.ASSET_CREATE> {
        const payload: AssetCreatePayload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS1,
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

    public mint(beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Mint = {
            beneficiary: hexToBytes(beneficiary),
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

        const rawPayload = this.polorize<MAS1.Mint>(payload, MINT_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
              opType: OpType.ASSET_INVOKE,
              payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.MINT,
                calldata: bytesToHex(rawPayload) as Hex,
              },
              participants: participants,
              signer: this.signer,
        })
    }

    public mintWithMetadata(beneficiary: string, staticMetadata: Record<string, Uint8Array>): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.MintWithMetadata = {
            beneficiary: hexToBytes(beneficiary),
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

        const rawPayload = this.polorize<MAS1.MintWithMetadata>(payload, MINT_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
              opType: OpType.ASSET_INVOKE,
              payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.MINT,
                calldata: bytesToHex(rawPayload) as Hex,
              },
              participants: participants,
              signer: this.signer,
        })
    }

    public burn(tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Burn = {
            token_id: tokenId,
        }

        const participants: IxParticipant[] = [
            {
                id: this.assetId as Hex,
                lock_type: LockType.MUTATE_LOCK,
            }
        ]

        const rawPayload = this.polorize<MAS1.Burn>(payload, BURN_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.BURN,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public transfer(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Transfer = {
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

        const rawPayload = this.polorize<MAS1.Transfer>(payload, TRANSFER_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.TRANSFER,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public transferFrom(tokenId: number | bigint, benefactor: string, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.TransferFrom = {
            token_id: tokenId,
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
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

        const rawPayload = this.polorize<MAS1.Transfer>(payload, TRANSFER_FROM_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.TRANSFERFROM,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public approve(tokenId: number | bigint, beneficiary: string, expiresAt: number): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Approve = {
            token_id: tokenId,
            beneficiary: hexToBytes(beneficiary),
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

        const rawPayload = this.polorize<MAS1.Approve>(payload, APPROVE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.APPROVE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public revoke(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Revoke = {
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

        const rawPayload = this.polorize<MAS1.Revoke>(payload, REVOKE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.REVOKE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public lockup(tokenId: number | bigint, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Lockup = {
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
            },
            {
                id: SARGA_ADDRESS as Hex,
                lock_type: LockType.MUTATE_LOCK
            }
        ]

        const rawPayload = this.polorize<MAS1.Lockup>(payload, LOCKUP_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.LOCKUP,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        })
    }

    public release(tokenId: number | bigint, benefactor: string, beneficiary: string): InteractionContext<OpType.ASSET_INVOKE> {
        const payload: MAS1.Release = {
            token_id: tokenId,
            benefactor: hexToBytes(benefactor),
            beneficiary: hexToBytes(beneficiary),
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

        const rawPayload = this.polorize<MAS1.Release>(payload, RELEASE_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.RELEASE,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: participants,
            signer: this.signer,
        });
    }

    public SetStaticMetadata(key: string, value: Uint8Array) {
        const payload: MAS1.SetStaticMetadata = {
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS1.SetStaticMetadata>(payload, SET_STATIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.SETSTATICTOKENMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public SetDynamicMetadata(key: string, value: Uint8Array) {
        const payload: MAS1.SetDynamicMetadata = {
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS1.SetDynamicMetadata>(payload, SET_DYNAMIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.SETDYNAMICTOKENMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public SetStaticTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array) {
        const payload: MAS1.SetStaticTokenMetadata = {
            token_id: tokenId,
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS1.SetStaticTokenMetadata>(payload, SET_STATIC_TOKEN_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.SETSTATICTOKENMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public SetDynamicTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array) {
        const payload: MAS1.SetDynamicTokenMetadata = {
            token_id: tokenId,
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS1.SetDynamicTokenMetadata>(payload, SET_DYNAMIC_TOKEN_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.SETDYNAMICMETADATA,
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
                callsite: MAS1.Endpoint.SYMBOL,
            },
            participants: [],
            signer: this.signer,
        }) 
    }

    public isOwner(tokenId: number | bigint, address: Uint8Array) {
        const payload: MAS1.IsOwner = {
            token_id: tokenId,
            address: address,
        }

        const rawPayload = this.polorize<MAS1.IsOwner>(payload, IS_OWNER_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.SYMBOL,
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
                callsite: MAS1.Endpoint.CREATOR,
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
                callsite: MAS1.Endpoint.MANAGER,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetStaticMetadata(key: string) {
        const payload: MAS1.GetStaticMetadata = {
            key: key,
        }

        const rawPayload = this.polorize<MAS1.GetStaticMetadata>(payload, GET_STATIC_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.GETSTATICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetDynamicMetadata(key: string) {
        const payload: MAS1.GetDynamicMetadata = {
            key: key,
        }

        const rawPayload = this.polorize<MAS1.GetDynamicMetadata>(payload, GET_DYNAMIC_METADATA_SCHEMA)
        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.GETDYNAMICMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetStaticTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array) {
        const payload: MAS1.SetStaticTokenMetadata = {
            token_id: tokenId,
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS1.GetStaticTokenMetadata>(payload, GET_STATIC_TOKEN_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.GETSTATICTOKENMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }

    public GetDynamicTokenMetadata(tokenId: number | bigint, key: string, value: Uint8Array) {
        const payload: MAS1.SetDynamicTokenMetadata = {
            token_id: tokenId,
            key: key,
            value: value
        }

        const rawPayload = this.polorize<MAS1.GetDynamicTokenMetadata>(payload, GET_DYNAMIC_TOKEN_METADATA_SCHEMA)

        return new InteractionContext<OpType.ASSET_INVOKE>({
            opType: OpType.ASSET_INVOKE,
            payload: {
                asset_id: trimHexPrefix(this.assetId) as Hex,
                callsite: MAS1.Endpoint.GETDYNAMICTOKENMETADATA,
                calldata: bytesToHex(rawPayload) as Hex,
            },
            participants: [],
            signer: this.signer,
        })  
    }
}
