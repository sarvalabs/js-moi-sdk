import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { isValidAddress } from "./address";
import { AssetStandard, OpType } from "./enums";
import { ErrorCode, ErrorUtils } from "./errors";
import { hexToBytes, isHex } from "./hex";
const createInvalidResult = (value, field, message) => {
    return { field, message, value: value[field] };
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
        transform: (payload) => ({ ...payload, address: hexToBytes(payload.address) }),
        validator: (payload) => {
            if (!isValidAddress(payload.address)) {
                return createInvalidResult(payload, "address", "Invalid address");
            }
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
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
            if (payload.supply < 0) {
                return createInvalidResult(payload, "supply", "Supply cannot be negative");
            }
            if (!(payload.standard in AssetStandard)) {
                return createInvalidResult(payload, "standard", "Invalid asset standard");
            }
            if (payload.dimension && payload.dimension < 0) {
                return createInvalidResult(payload, "dimension", "Dimension cannot be negative");
            }
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
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            if (!isHex(payload.asset_id)) {
                return createInvalidResult(payload, "asset_id", "Invalid asset ID");
            }
            return null;
        },
    });
};
const createAssetActionDescriptor = (type) => {
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
        transform: (payload) => {
            const raw = {
                ...payload,
                benefactor: "benefactor" in payload && isValidAddress(payload.benefactor) ? hexToBytes(payload.benefactor) : new Uint8Array(32),
                beneficiary: hexToBytes(payload.beneficiary),
            };
            return raw;
        },
        validator: (payload) => {
            if ("benefactor" in payload && !isValidAddress(payload.benefactor)) {
                return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
            }
            if (!isValidAddress(payload.beneficiary)) {
                return createInvalidResult(payload, "beneficiary", "Invalid beneficiary address");
            }
            if ([OpType.AssetTransfer, OpType.AssetApprove].includes(type)) {
                if (!("amount" in payload)) {
                    return createInvalidResult(payload, "amount", "Amount is required for transfer and approve operations");
                }
                if (payload.amount < 0) {
                    return createInvalidResult(payload, "amount", "Amount cannot be negative");
                }
            }
            if (!isHex(payload.asset_id)) {
                return createInvalidResult(payload, "asset_id", "Invalid asset ID");
            }
            if (type === OpType.AssetApprove) {
                if (!("timestamp" in payload)) {
                    return createInvalidResult(payload, "timestamp", "Timestamp is required for approve operation");
                }
            }
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
            if (type === OpType.LogicDeploy) {
                if (!("manifest" in payload)) {
                    return createInvalidResult(payload, "manifest", "Manifest is required for logic deploy operation");
                }
                if (!isHex(payload.manifest)) {
                    return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
                }
            }
            if (type !== OpType.LogicDeploy || type === OpType.LogicEnlist) {
                if (!("logic_id" in payload)) {
                    return createInvalidResult(payload, "logic_id", "Logic ID is required");
                }
            }
            if ("calldata" in payload && !isHex(payload.calldata)) {
                return createInvalidResult(payload, "calldata", "Calldata must be a hex string");
            }
            if (payload.callsite == null || payload.callsite === "") {
                return createInvalidResult(payload, "callsite", "Callsite is required");
            }
            return null;
        },
    });
};
const ixOpDescriptor = {
    [OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [OpType.AssetCreate]: createAssetCreateDescriptor(),
    [OpType.AssetMint]: createAssetSupplyDescriptorFor(OpType.AssetMint),
    [OpType.AssetBurn]: createAssetSupplyDescriptorFor(OpType.AssetBurn),
    [OpType.AssetTransfer]: createAssetActionDescriptor(OpType.AssetTransfer),
    [OpType.AssetApprove]: createAssetActionDescriptor(OpType.AssetApprove),
    [OpType.AssetRelease]: createAssetActionDescriptor(OpType.AssetRelease),
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
export const encodeOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    const polorizer = new Polorizer();
    const data = transformPayload(operation.type, operation.payload);
    polorizer.polorize(data, descriptor.schema());
    return { type: operation.type, payload: polorizer.bytes() };
};
/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
export const isValidOperation = (operation) => {
    return validateOperation(operation) == null;
};
/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
export const validateOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    return descriptor.validator(operation.payload);
};
//# sourceMappingURL=operations.js.map