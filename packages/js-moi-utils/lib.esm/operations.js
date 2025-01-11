import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { OpType } from "./enums";
import { ErrorCode, ErrorUtils } from "./errors";
import { hexToBytes } from "./hex";
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
        transform: (payload) => ({ ...payload, address: hexToBytes(payload.address) }),
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
        transform: (payload) => ({
            ...payload,
            benefactor: hexToBytes(payload.benefactor),
            beneficiary: hexToBytes(payload.beneficiary),
        }),
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
        transform: (payload) => {
            if (type === OpType.LogicDeploy) {
                if (!("manifest" in payload)) {
                    ErrorUtils.throwError("Manifest is required for LogicDeploy operation", ErrorCode.INVALID_ARGUMENT);
                }
                const raw = {
                    ...payload,
                    manifest: hexToBytes(payload.manifest),
                    calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                    interfaces: payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
                };
                return raw;
            }
            if (!("logic_id" in payload)) {
                ErrorUtils.throwError("Logic ID is required for LogicEnlist and LogicInvoke operations", ErrorCode.INVALID_ARGUMENT);
            }
            const raw = {
                ...payload,
                logic_id: payload.logic_id,
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
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
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
export const transformPayload = (type, payload) => {
    const descriptor = getIxOperationDescriptor(type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${type}" is not supported`);
    }
    return descriptor.transform?.(payload) ?? payload;
};
/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export const encodeOperationPayload = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    const polorizer = new Polorizer();
    const data = transformPayload(operation.type, operation.payload);
    polorizer.polorize(data, descriptor.schema());
    return polorizer.bytes();
};
//# sourceMappingURL=operations.js.map