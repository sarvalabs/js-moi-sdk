"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeIxOperationToPolo = exports.getIxOperationDescriptor = exports.listIxOperationDescriptors = void 0;
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const enums_1 = require("./enums");
const hex_1 = require("./hex");
const encodeToPolo = (type, data) => {
    const schema = ixOpDescriptor[type]?.schema();
    if (schema == null) {
        throw new Error(`Schema for operation type "${type}" is not registered`);
    }
    const polorizer = new js_polo_1.Polorizer();
    polorizer.polorize(data, schema);
    return polorizer.bytes();
};
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
        serializer: (payload) => {
            return encodeToPolo(enums_1.OpType.ParticipantCreate, { ...payload, address: (0, hex_1.hexToBytes)(payload.address) });
        },
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
        serializer: (payload) => encodeToPolo(enums_1.OpType.AssetCreate, payload),
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
        serializer: (payload) => encodeToPolo(type, payload),
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
        serializer: (payload) => {
            return encodeToPolo(enums_1.OpType.AssetTransfer, {
                ...payload,
                benefactor: (0, hex_1.hexToBytes)(payload.benefactor),
                beneficiary: (0, hex_1.hexToBytes)(payload.beneficiary),
            });
        },
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
        serializer: (payload) => {
            return encodeToPolo(type, {
                ...payload,
                manifest: "manifest" in payload && payload.manifest != null ? (0, hex_1.hexToBytes)(payload.manifest) : undefined,
                calldata: payload.calldata != null ? (0, hex_1.hexToBytes)(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            });
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
 * Encodes an operation to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded operation as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
const encodeIxOperationToPolo = (operation) => {
    const descriptor = (0, exports.getIxOperationDescriptor)(operation.type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }
    return descriptor.serializer(operation.payload);
};
exports.encodeIxOperationToPolo = encodeIxOperationToPolo;
//# sourceMappingURL=operations.js.map