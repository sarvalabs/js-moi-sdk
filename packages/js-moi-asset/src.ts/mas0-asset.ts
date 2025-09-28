import { AssetCreationResult, AssetStandard, bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS0 } from "../types/mas0";
import { Polorizer, Schema } from "js-polo";
import { APPROVE_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schemas";
import { Signer } from "js-moi-signer";
import { AssetActionPayload, AssetCreatePayload, InteractionResponse, IxParticipant } from "js-moi-providers";
import { SARGA_ADDRESS } from "js-moi-constants";

export class MAS0AssetLogic {
    assetId: string
    signer: Signer

    constructor(assetId: string, signer: Signer) {
        this.assetId = assetId;
        this.signer = signer;
    }

    private async send(
        callsite: MAS0.Endpoint, calldata: Uint8Array, 
        participants: IxParticipant[],
    ): Promise<InteractionResponse> {
        const payload: AssetActionPayload = {
            asset_id: this.assetId as Hex,
            callsite: callsite,
            calldata: bytesToHex(calldata) as Hex,
        }

        return this.signer.sendInteraction({
            sender: {
                id: (await this.signer.getIdentifier()).toHex(),
                sequence: (await this.signer.getNonce()) as number,
                key_id: (await this.signer.getKeyId()),
            },
            fuel_price: 1,
            fuel_limit: 10000,
            ix_operations: [
                {
                    type: OpType.ASSET_INVOKE,
                    payload: payload,
                }
            ],
            participants
        })
    }

    private polorize<T extends MAS0.OperationPayload>(payload: T, schema: Schema): Uint8Array {
        const polorizer = new Polorizer()
        polorizer.polorize(payload, schema)

        return polorizer.bytes()
    }

    static async create(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean,
    ): Promise<MAS0AssetLogic> {
        const payload: AssetCreatePayload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager as Hex,
        }

        const response = await signer.sendInteraction({
            sender: {
                id: (await signer.getIdentifier()).toHex(),
                sequence: (await signer.getNonce()) as number,
                key_id: (await signer.getKeyId()),
            },
            fuel_price: 1,
            fuel_limit: 10000,
            ix_operations: [
                {
                    type: OpType.ASSET_CREATE,
                    payload: payload,
                }
            ],
        })

        const result:AssetCreationResult = await response.result()

        return new MAS0AssetLogic(result.asset_id, signer)
    }

    public async mint(beneficiary: string, amount: number | bigint) {
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

        return await this.send(MAS0.Endpoint.MINT, rawPayload, participants)
    }

    public async burn(amount: number | bigint) {
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

        return await this.send(MAS0.Endpoint.BURN, rawPayload, participants)
    }

    public async transfer(beneficiary: string, amount: number | bigint) {
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

        return await this.send(MAS0.Endpoint.TRANSFER, rawPayload, participants)
    }

    public async approve(beneficiary: string, amount: number | bigint, expiresAt: number) {
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
            },
            {
                id: this.assetId as Hex,
                lock_type: LockType.NO_LOCK, 
            }
        ]

        const rawPayload = this.polorize<MAS0.Approve>(payload, APPROVE_SCHEMA)

        return await this.send(MAS0.Endpoint.APPROVE, rawPayload, participants)
    }

    public async revoke(beneficiary: string) {
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

        return await this.send(MAS0.Endpoint.REVOKE, rawPayload, participants)
    }

    public async lockup(beneficiary: string, amount: number | bigint) {
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

        return await this.send(MAS0.Endpoint.LOCKUP, rawPayload, participants)
    }

    public async release(benefactor: string, beneficiary: string, amount: number | bigint) {
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

        return await this.send(MAS0.Endpoint.RELEASE, rawPayload, participants)
    }
}
