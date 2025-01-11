import { ErrorUtils, hexToBytes, isValidAddress, OpType } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
export class OperationSerializer {
    serialize(payload) {
        const polorizer = new Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}
export class AssetCreateSerializer extends OperationSerializer {
    type = OpType.AssetCreate;
    schema = polo.struct({
        symbol: polo.string,
        supply: polo.integer,
        standard: polo.integer,
        dimension: polo.integer,
        is_stateful: polo.boolean,
        is_logical: polo.boolean,
        logic_payload: polo.struct({
            manifest: polo.bytes,
            logic_id: polo.string,
            callsite: polo.string,
            calldata: polo.bytes,
            interface: polo.map({
                keys: polo.string,
                values: polo.string,
            }),
        }),
    });
}
const createAssetSupplySerializer = (type) => {
    return class AssetSupplySerializer extends OperationSerializer {
        type = type;
        schema = polo.struct({
            asset_id: polo.string,
            amount: polo.integer,
        });
    };
};
export const AssetMintSerializer = createAssetSupplySerializer(OpType.AssetMint);
export const AssetBurnSerializer = createAssetSupplySerializer(OpType.AssetBurn);
export class ParticipantCreateSerializer extends OperationSerializer {
    type = OpType.ParticipantCreate;
    schema = polo.struct({
        address: polo.bytes,
        keys_payload: polo.arrayOf(polo.struct({
            public_key: polo.bytes,
            weight: polo.integer,
            signature_algorithm: polo.integer,
        })),
        amount: polo.integer,
    });
    serialize(payload) {
        if (payload.address == null) {
            ErrorUtils.throwArgumentError("'address' is required for participant create operation", "address", payload.address);
        }
        if (isValidAddress(payload.address) === false) {
            ErrorUtils.throwArgumentError("Invalid address", "address", payload.address);
        }
        return super.serialize({ ...payload, address: hexToBytes(payload.address) });
    }
}
export class AssetActionSerializer extends OperationSerializer {
    type = OpType.AssetTransfer;
    schema = polo.struct({
        benefactor: polo.bytes,
        beneficiary: polo.bytes,
        asset_id: polo.string,
        amount: polo.integer,
        timestamp: polo.integer,
    });
    serialize(payload) {
        if (payload.beneficiary == null) {
            ErrorUtils.throwArgumentError(`'beneficiary' is required for ${this.type} operation`, "beneficiary", payload.beneficiary);
        }
        if (isValidAddress(payload.beneficiary) === false) {
            ErrorUtils.throwArgumentError("Invalid beneficiary address", "beneficiary", payload.beneficiary);
        }
        if (payload.amount == null) {
            ErrorUtils.throwArgumentError(`'amount' is required for ${this.type} operation`, "amount", payload.amount);
        }
        if (payload.amount < 0) {
            ErrorUtils.throwArgumentError("Amount must be greater than or equal to zero", "amount", payload.amount);
        }
        if (payload.asset_id == null) {
            ErrorUtils.throwArgumentError(`'asset_id' is required for ${this.type} operation`, "asset_id", payload.asset_id);
        }
        return super.serialize({
            ...payload,
            benefactor: hexToBytes(payload.benefactor),
            beneficiary: hexToBytes(payload.beneficiary),
        });
    }
}
const createLogicActionSerializer = (type) => {
    return class LogicActionSerializer extends OperationSerializer {
        type = type;
        schema = polo.struct({
            manifest: polo.bytes,
            logic_id: polo.string,
            callsite: polo.string,
            calldata: polo.bytes,
            interfaces: polo.map({
                keys: polo.string,
                values: polo.string,
            }),
        });
        serialize(payload) {
            if (this.type === OpType.LogicDeploy) {
                if ("manifest" in payload && payload.manifest == null) {
                    ErrorUtils.throwArgumentError(`'manifest' is required for ${this.type} operation`, "manifest", payload.manifest);
                }
            }
            if (this.type === OpType.LogicInvoke || this.type === OpType.LogicEnlist) {
                if ("logic_id" in payload && payload.logic_id == null) {
                    ErrorUtils.throwArgumentError(`'logic_id' is required for ${this.type} operation`, "logic_id", payload.logic_id);
                }
            }
            if ("callsite" in payload && payload.callsite == null) {
                ErrorUtils.throwArgumentError("'callsite' is required for logic operation", "callsite", payload.callsite);
            }
            return super.serialize({
                ...payload,
                manifest: "manifest" in payload && payload.manifest != null ? hexToBytes(payload.manifest) : undefined,
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            });
        }
    };
};
export const LogicDeploySerializer = createLogicActionSerializer(OpType.LogicDeploy);
export const LogicInvokeSerializer = createLogicActionSerializer(OpType.LogicInvoke);
export const LogicEnlistSerializer = createLogicActionSerializer(OpType.LogicEnlist);
//# sourceMappingURL=operation-serializer.js.map