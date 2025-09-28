"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAS0AssetLogic = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const mas0_1 = require("../types/mas0");
const js_polo_1 = require("js-polo");
const mas0_schemas_1 = require("./mas0-schemas");
const js_moi_constants_1 = require("js-moi-constants");
class MAS0AssetLogic {
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
            calldata: (0, js_moi_utils_1.bytesToHex)(calldata),
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
                    type: js_moi_utils_1.OpType.ASSET_INVOKE,
                    payload: payload,
                }
            ],
            participants
        });
    }
    polorize(payload, schema) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(payload, schema);
        return polorizer.bytes();
    }
    static async create(signer, symbol, supply, manager, enableEvents) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: js_moi_utils_1.AssetStandard.MAS0,
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
                    type: js_moi_utils_1.OpType.ASSET_CREATE,
                    payload: payload,
                }
            ],
        });
        const result = await response.result();
        return new MAS0AssetLogic(result.asset_id, signer);
    }
    async mint(beneficiary, amount) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.MINT_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.MINT, rawPayload, participants);
    }
    async burn(amount) {
        const payload = {
            amount: amount,
        };
        const participants = [
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.BURN_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.BURN, rawPayload, participants);
    }
    async transfer(beneficiary, amount) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.TRANSFER_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.TRANSFER, rawPayload, participants);
    }
    async approve(beneficiary, amount, expiresAt) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount,
            expires_at: expiresAt
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.APPROVE_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.APPROVE, rawPayload, participants);
    }
    async revoke(beneficiary) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.REVOKE_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.REVOKE, rawPayload, participants);
    }
    async lockup(beneficiary, amount) {
        const payload = {
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            },
            {
                id: js_moi_constants_1.SARGA_ADDRESS,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.LOCKUP_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.LOCKUP, rawPayload, participants);
    }
    async release(benefactor, beneficiary, amount) {
        const payload = {
            benefactor: (0, js_moi_utils_1.hexToBytes)(benefactor),
            beneficiary: (0, js_moi_utils_1.hexToBytes)(beneficiary),
            amount: amount
        };
        const participants = [
            {
                id: beneficiary,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: benefactor,
                lock_type: js_moi_utils_1.LockType.MUTATE_LOCK,
            },
            {
                id: this.assetId,
                lock_type: js_moi_utils_1.LockType.NO_LOCK,
            }
        ];
        const rawPayload = this.polorize(payload, mas0_schemas_1.RELEASE_SCHEMA);
        return await this.send(mas0_1.MAS0.Endpoint.RELEASE, rawPayload, participants);
    }
}
exports.MAS0AssetLogic = MAS0AssetLogic;
//# sourceMappingURL=mas0-asset.js.map