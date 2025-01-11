"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicEnlistSerializer = exports.LogicInvokeSerializer = exports.LogicDeploySerializer = exports.AssetActionSerializer = exports.ParticipantCreateSerializer = exports.AssetBurnSerializer = exports.AssetMintSerializer = exports.AssetCreateSerializer = exports.OperationSerializer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
class OperationSerializer {
    serialize(payload) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}
exports.OperationSerializer = OperationSerializer;
class AssetCreateSerializer extends OperationSerializer {
    type = js_moi_utils_1.OpType.AssetCreate;
    schema = polo_schema_1.polo.struct({
        symbol: polo_schema_1.polo.string,
        supply: polo_schema_1.polo.integer,
        standard: polo_schema_1.polo.integer,
        dimension: polo_schema_1.polo.integer,
        is_stateful: polo_schema_1.polo.boolean,
        is_logical: polo_schema_1.polo.boolean,
        logic_payload: polo_schema_1.polo.struct({
            manifest: polo_schema_1.polo.bytes,
            logic_id: polo_schema_1.polo.string,
            callsite: polo_schema_1.polo.string,
            calldata: polo_schema_1.polo.bytes,
            interface: polo_schema_1.polo.map({
                keys: polo_schema_1.polo.string,
                values: polo_schema_1.polo.string,
            }),
        }),
    });
}
exports.AssetCreateSerializer = AssetCreateSerializer;
const createAssetSupplySerializer = (type) => {
    return class AssetSupplySerializer extends OperationSerializer {
        type = type;
        schema = polo_schema_1.polo.struct({
            asset_id: polo_schema_1.polo.string,
            amount: polo_schema_1.polo.integer,
        });
    };
};
exports.AssetMintSerializer = createAssetSupplySerializer(js_moi_utils_1.OpType.AssetMint);
exports.AssetBurnSerializer = createAssetSupplySerializer(js_moi_utils_1.OpType.AssetBurn);
class ParticipantCreateSerializer extends OperationSerializer {
    type = js_moi_utils_1.OpType.ParticipantCreate;
    schema = polo_schema_1.polo.struct({
        address: polo_schema_1.polo.bytes,
        keys_payload: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            public_key: polo_schema_1.polo.bytes,
            weight: polo_schema_1.polo.integer,
            signature_algorithm: polo_schema_1.polo.integer,
        })),
        amount: polo_schema_1.polo.integer,
    });
    serialize(payload) {
        if (payload.address == null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("'address' is required for participant create operation", "address", payload.address);
        }
        if ((0, js_moi_utils_1.isValidAddress)(payload.address) === false) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid address", "address", payload.address);
        }
        return super.serialize({ ...payload, address: (0, js_moi_utils_1.hexToBytes)(payload.address) });
    }
}
exports.ParticipantCreateSerializer = ParticipantCreateSerializer;
class AssetActionSerializer extends OperationSerializer {
    type = js_moi_utils_1.OpType.AssetTransfer;
    schema = polo_schema_1.polo.struct({
        benefactor: polo_schema_1.polo.bytes,
        beneficiary: polo_schema_1.polo.bytes,
        asset_id: polo_schema_1.polo.string,
        amount: polo_schema_1.polo.integer,
        timestamp: polo_schema_1.polo.integer,
    });
    serialize(payload) {
        if (payload.beneficiary == null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`'beneficiary' is required for ${this.type} operation`, "beneficiary", payload.beneficiary);
        }
        if ((0, js_moi_utils_1.isValidAddress)(payload.beneficiary) === false) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid beneficiary address", "beneficiary", payload.beneficiary);
        }
        if (payload.amount == null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`'amount' is required for ${this.type} operation`, "amount", payload.amount);
        }
        if (payload.amount < 0) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Amount must be greater than or equal to zero", "amount", payload.amount);
        }
        if (payload.asset_id == null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`'asset_id' is required for ${this.type} operation`, "asset_id", payload.asset_id);
        }
        return super.serialize({
            ...payload,
            benefactor: (0, js_moi_utils_1.hexToBytes)(payload.benefactor),
            beneficiary: (0, js_moi_utils_1.hexToBytes)(payload.beneficiary),
        });
    }
}
exports.AssetActionSerializer = AssetActionSerializer;
const createLogicActionSerializer = (type) => {
    return class LogicActionSerializer extends OperationSerializer {
        type = type;
        schema = polo_schema_1.polo.struct({
            manifest: polo_schema_1.polo.bytes,
            logic_id: polo_schema_1.polo.string,
            callsite: polo_schema_1.polo.string,
            calldata: polo_schema_1.polo.bytes,
            interfaces: polo_schema_1.polo.map({
                keys: polo_schema_1.polo.string,
                values: polo_schema_1.polo.string,
            }),
        });
        serialize(payload) {
            if (this.type === js_moi_utils_1.OpType.LogicDeploy) {
                if ("manifest" in payload && payload.manifest == null) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError(`'manifest' is required for ${this.type} operation`, "manifest", payload.manifest);
                }
            }
            if (this.type === js_moi_utils_1.OpType.LogicInvoke || this.type === js_moi_utils_1.OpType.LogicEnlist) {
                if ("logic_id" in payload && payload.logic_id == null) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError(`'logic_id' is required for ${this.type} operation`, "logic_id", payload.logic_id);
                }
            }
            if ("callsite" in payload && payload.callsite == null) {
                js_moi_utils_1.ErrorUtils.throwArgumentError("'callsite' is required for logic operation", "callsite", payload.callsite);
            }
            return super.serialize({
                ...payload,
                manifest: "manifest" in payload && payload.manifest != null ? (0, js_moi_utils_1.hexToBytes)(payload.manifest) : undefined,
                calldata: payload.calldata != null ? (0, js_moi_utils_1.hexToBytes)(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            });
        }
    };
};
exports.LogicDeploySerializer = createLogicActionSerializer(js_moi_utils_1.OpType.LogicDeploy);
exports.LogicInvokeSerializer = createLogicActionSerializer(js_moi_utils_1.OpType.LogicInvoke);
exports.LogicEnlistSerializer = createLogicActionSerializer(js_moi_utils_1.OpType.LogicEnlist);
//# sourceMappingURL=operation-serializer.js.map