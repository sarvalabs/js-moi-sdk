"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeOperationPayload = exports.transformPayload = exports.getIxOperationDescriptor = exports.listIxOperationDescriptors = void 0;
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const enums_1 = require("./enums");
const errors_1 = require("./errors");
const hex_1 = require("./hex");
const createParticipantCreateDescriptor = () => {
    return Object.freeze({
        schema: () => {
            return polo_schema_1.polo.struct({
                address: polo_schema_1.polo.bytes,
                keys_payload: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
                    public_key: polo_schema_1.polo.bytes,
                    weight: polo_schema_1.polo.integer,
                    signature_algorithm: polo_schema_1.polo.integer,
                })),
                amount: polo_schema_1.polo.integer,
            });
        },
        transform: (payload) => ({ ...payload, address: (0, hex_1.hexToBytes)(payload.address) }),
        validator: (payload) => {
            return null;
        },
    });
};
const createAssetCreateDescriptor = () => {
    return Object.freeze({
        schema: () => {
            const logicPayloadSchema = polo_schema_1.polo.struct({
                manifest: polo_schema_1.polo.bytes,
                logic_id: polo_schema_1.polo.string,
                callsite: polo_schema_1.polo.string,
                calldata: polo_schema_1.polo.bytes,
                interface: polo_schema_1.polo.map({ keys: polo_schema_1.polo.string, values: polo_schema_1.polo.string }),
            });
            return polo_schema_1.polo.struct({
                symbol: polo_schema_1.polo.string,
                supply: polo_schema_1.polo.integer,
                standard: polo_schema_1.polo.integer,
                dimension: polo_schema_1.polo.integer,
                is_stateful: polo_schema_1.polo.boolean,
                is_logical: polo_schema_1.polo.boolean,
                logic_payload: logicPayloadSchema,
            });
        },
        validator: (payload) => {
            return null;
        },
    });
};
const createAssetSupplyDescriptorFor = (type) => {
    return Object.freeze({
        schema: () => {
            return polo_schema_1.polo.struct({
                asset_id: polo_schema_1.polo.string,
                amount: polo_schema_1.polo.integer,
            });
        },
        validator: (payload) => {
            return null;
        },
    });
};
const createAssetActionDescriptor = () => {
    return Object.freeze({
        schema: () => {
            return polo_schema_1.polo.struct({
                benefactor: polo_schema_1.polo.bytes,
                beneficiary: polo_schema_1.polo.bytes,
                asset_id: polo_schema_1.polo.string,
                amount: polo_schema_1.polo.integer,
                timestamp: polo_schema_1.polo.integer,
            });
        },
        transform: (payload) => ({
            ...payload,
            benefactor: (0, hex_1.hexToBytes)(payload.benefactor),
            beneficiary: (0, hex_1.hexToBytes)(payload.beneficiary),
        }),
        validator: (payload) => {
            return null;
        },
    });
};
const createLogicActionDescriptor = (type) => {
    return Object.freeze({
        schema: () => {
            return polo_schema_1.polo.struct({
                manifest: polo_schema_1.polo.bytes,
                logic_id: polo_schema_1.polo.string,
                callsite: polo_schema_1.polo.string,
                calldata: polo_schema_1.polo.bytes,
                interfaces: polo_schema_1.polo.map({
                    keys: polo_schema_1.polo.string,
                    values: polo_schema_1.polo.string,
                }),
            });
        },
        transform: (payload) => {
            if (type === enums_1.OpType.LogicDeploy) {
                if (!("manifest" in payload)) {
                    errors_1.ErrorUtils.throwError("Manifest is required for LogicDeploy operation", errors_1.ErrorCode.INVALID_ARGUMENT);
                }
                const raw = {
                    ...payload,
                    manifest: (0, hex_1.hexToBytes)(payload.manifest),
                    calldata: payload.calldata != null ? (0, hex_1.hexToBytes)(payload.calldata) : undefined,
                    interfaces: payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
                };
                return raw;
            }
            if (!("logic_id" in payload)) {
                errors_1.ErrorUtils.throwError("Logic ID is required for LogicEnlist and LogicInvoke operations", errors_1.ErrorCode.INVALID_ARGUMENT);
            }
            const raw = {
                ...payload,
                logic_id: payload.logic_id,
                calldata: payload.calldata != null ? (0, hex_1.hexToBytes)(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            };
            return raw;
        },
        validator: (payload) => {
            return null;
        },
    });
};
const ixOpDescriptor = {
    [enums_1.OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [enums_1.OpType.AssetCreate]: createAssetCreateDescriptor(),
    [enums_1.OpType.AssetMint]: createAssetSupplyDescriptorFor(enums_1.OpType.AssetMint),
    [enums_1.OpType.AssetBurn]: createAssetSupplyDescriptorFor(enums_1.OpType.AssetBurn),
    [enums_1.OpType.AssetTransfer]: createAssetActionDescriptor(),
    [enums_1.OpType.LogicDeploy]: createLogicActionDescriptor(enums_1.OpType.LogicDeploy),
    [enums_1.OpType.LogicInvoke]: createLogicActionDescriptor(enums_1.OpType.LogicInvoke),
    [enums_1.OpType.LogicEnlist]: createLogicActionDescriptor(enums_1.OpType.LogicEnlist),
};
/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
const listIxOperationDescriptors = () => {
    return Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type), descriptor };
    });
};
exports.listIxOperationDescriptors = listIxOperationDescriptors;
/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
const getIxOperationDescriptor = (type) => ixOpDescriptor[type] ?? null;
exports.getIxOperationDescriptor = getIxOperationDescriptor;
/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
const transformPayload = (type, payload) => {
    const descriptor = (0, exports.getIxOperationDescriptor)(type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${type}" is not supported`);
    }
    return descriptor.transform?.(payload) ?? payload;
};
exports.transformPayload = transformPayload;
/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
const encodeOperationPayload = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    const polorizer = new js_polo_1.Polorizer();
    const data = (0, exports.transformPayload)(operation.type, operation.payload);
    polorizer.polorize(data, descriptor.schema());
    return polorizer.bytes();
};
exports.encodeOperationPayload = encodeOperationPayload;
//# sourceMappingURL=operations.js.map