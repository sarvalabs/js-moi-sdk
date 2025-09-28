import { AssetStandard, bytesToHex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS0 } from "../types/mas0";
import { Polorizer } from "js-polo";
import { APPROVE_SCHEMA, BURN_SCHEMA, LOCKUP_SCHEMA, MINT_SCHEMA, RELEASE_SCHEMA, REVOKE_SCHEMA, TRANSFER_SCHEMA } from "./mas0-schemas";
import { SARGA_ADDRESS } from "js-moi-constants";
export class MAS0AssetLogic {
    assetId;
    signer;
    constructor(assetId, signer) {
        this.assetId = assetId;
        this.signer = signer;
    }
    async send(callsite, calldata, participants) {
        const payload = {
            asset_id: this.assetId,
            callsite: callsite,
            calldata: bytesToHex(calldata),
        };
        return this.signer.sendInteraction({
            sender: {
                id: (await this.signer.getIdentifier()).toHex(),
                sequence: (await this.signer.getNonce()),
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
        });
    }
    polorize(payload, schema) {
        const polorizer = new Polorizer();
        polorizer.polorize(payload, schema);
        return polorizer.bytes();
    }
    static async create(signer, symbol, supply, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
        };
        const response = await signer.sendInteraction({
            sender: {
                id: (await signer.getIdentifier()).toHex(),
                sequence: (await signer.getNonce()),
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
        });
        const result = await response.result();
        return new MAS0AssetLogic(result.asset_id, signer);
    }
    async mint(beneficiary, amount) {
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
        return await this.send(MAS0.Endpoint.MINT, rawPayload, participants);
    }
    async burn(amount) {
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
        return await this.send(MAS0.Endpoint.BURN, rawPayload, participants);
    }
    async transfer(beneficiary, amount) {
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
        return await this.send(MAS0.Endpoint.TRANSFER, rawPayload, participants);
    }
    async approve(beneficiary, amount, expiresAt) {
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
        return await this.send(MAS0.Endpoint.APPROVE, rawPayload, participants);
    }
    async revoke(beneficiary) {
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
        return await this.send(MAS0.Endpoint.REVOKE, rawPayload, participants);
    }
    async lockup(beneficiary, amount) {
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
        return await this.send(MAS0.Endpoint.LOCKUP, rawPayload, participants);
    }
    async release(benefactor, beneficiary, amount) {
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
        return await this.send(MAS0.Endpoint.RELEASE, rawPayload, participants);
    }
}
//# sourceMappingURL=mas0-asset.js.map