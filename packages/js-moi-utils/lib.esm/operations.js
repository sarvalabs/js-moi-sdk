import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { OpType } from "./enums";
import { hexToBytes } from "./hex";
const encodeToPolo = (type, data) => {
    const schema = ixOpDescriptor[type]?.schema();
    if (schema == null) {
        throw new Error(`Schema for operation type "${type}" is not registered`);
    }
    const polorizer = new Polorizer();
    polorizer.polorize(data, schema);
    return polorizer.bytes();
};
const createParticipantCreateDescriptor = () => {
    return Object.freeze({
        schema: () => {
            return polo.struct({
                address: polo.bytes,
                keys_payload: polo.arrayOf(polo.struct({
                    public_key: polo.bytes,
                    weight: polo.integer,
                    signature_algorithm: polo.integer,
                })),
                amount: polo.integer,
            });
        },
        serializer: (payload) => {
            return encodeToPolo(OpType.ParticipantCreate, { ...payload, address: hexToBytes(payload.address) });
        },
        validator: (payload) => {
            return null;
        },
    });
};
const createAssetCreateDescriptor = () => {
    return Object.freeze({
        schema: () => {
            const logicPayloadSchema = polo.struct({
                manifest: polo.bytes,
                logic_id: polo.string,
                callsite: polo.string,
                calldata: polo.bytes,
                interface: polo.map({ keys: polo.string, values: polo.string }),
            });
            return polo.struct({
                symbol: polo.string,
                supply: polo.integer,
                standard: polo.integer,
                dimension: polo.integer,
                is_stateful: polo.boolean,
                is_logical: polo.boolean,
                logic_payload: logicPayloadSchema,
            });
        },
        serializer: (payload) => encodeToPolo(OpType.AssetCreate, payload),
        validator: (payload) => {
            return null;
        },
    });
};
const createAssetSupplyDescriptorFor = (type) => {
    return Object.freeze({
        schema: () => {
            return polo.struct({
                asset_id: polo.string,
                amount: polo.integer,
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
            return polo.struct({
                benefactor: polo.bytes,
                beneficiary: polo.bytes,
                asset_id: polo.string,
                amount: polo.integer,
                timestamp: polo.integer,
            });
        },
        serializer: (payload) => {
            return encodeToPolo(OpType.AssetTransfer, {
                ...payload,
                benefactor: hexToBytes(payload.benefactor),
                beneficiary: hexToBytes(payload.beneficiary),
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
            return polo.struct({
                manifest: polo.bytes,
                logic_id: polo.string,
                callsite: polo.string,
                calldata: polo.bytes,
                interfaces: polo.map({
                    keys: polo.string,
                    values: polo.string,
                }),
            });
        },
        serializer: (payload) => {
            return encodeToPolo(type, {
                ...payload,
                manifest: "manifest" in payload && payload.manifest != null ? hexToBytes(payload.manifest) : undefined,
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            });
        },
        validator: (payload) => {
            return null;
        },
    });
};
const ixOpDescriptor = {
    [OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [OpType.AssetCreate]: createAssetCreateDescriptor(),
    [OpType.AssetMint]: createAssetSupplyDescriptorFor(OpType.AssetMint),
    [OpType.AssetBurn]: createAssetSupplyDescriptorFor(OpType.AssetBurn),
    [OpType.AssetTransfer]: createAssetActionDescriptor(),
    [OpType.LogicDeploy]: createLogicActionDescriptor(OpType.LogicDeploy),
    [OpType.LogicInvoke]: createLogicActionDescriptor(OpType.LogicInvoke),
    [OpType.LogicEnlist]: createLogicActionDescriptor(OpType.LogicEnlist),
};
/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
export const listIxOperationDescriptors = () => {
    return Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type), descriptor };
    });
};
/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
export const getIxOperationDescriptor = (type) => ixOpDescriptor[type] ?? null;
/**
 * Encodes an operation to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded operation as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export const encodeIxOperationToPolo = (operation) => {
    const descriptor = getIxOperationDescriptor(operation.type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }
    return descriptor.serializer(operation.payload);
};
//# sourceMappingURL=operations.js.map