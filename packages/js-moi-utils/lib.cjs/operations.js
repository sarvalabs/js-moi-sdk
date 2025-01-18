"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOperation = exports.isValidOperation = exports.encodeOperation = exports.transformPayload = exports.getIxOperationDescriptor = exports.listIxOperationDescriptors = void 0;
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const address_1 = require("./address");
const enums_1 = require("./enums");
const errors_1 = require("./errors");
const hex_1 = require("./hex");
const createInvalidResult = (value, field, message) => {
    return { field, message, value: value[field] };
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
        transform: (payload) => ({ ...payload, address: (0, hex_1.hexToBytes)(payload.address) }),
        validator: (payload) => {
            if (!(0, address_1.isValidAddress)(payload.address)) {
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
            if (payload.supply < 0) {
                return createInvalidResult(payload, "supply", "Supply cannot be negative");
            }
            if (!(payload.standard in enums_1.AssetStandard)) {
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
            return polo_schema_1.polo.struct({
                asset_id: polo_schema_1.polo.string,
                amount: polo_schema_1.polo.integer,
            });
        },
        validator: (payload) => {
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            if (!(0, hex_1.isHex)(payload.asset_id)) {
                return createInvalidResult(payload, "asset_id", "Invalid asset ID");
            }
            return null;
        },
    });
};
const createAssetActionDescriptor = (type) => {
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
        transform: (payload) => {
            const raw = {
                ...payload,
                benefactor: "benefactor" in payload && (0, hex_1.isHex)(payload.benefactor) ? (0, hex_1.hexToBytes)(payload.benefactor) : new Uint8Array(32),
                beneficiary: (0, hex_1.hexToBytes)(payload.beneficiary),
            };
            return raw;
        },
        validator: (payload) => {
            if ("benefactor" in payload && !(0, address_1.isValidAddress)(payload.benefactor)) {
                return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
            }
            if (!(0, address_1.isValidAddress)(payload.beneficiary)) {
                return createInvalidResult(payload, "beneficiary", "Invalid beneficiary address");
            }
            if ([enums_1.OpType.AssetTransfer, enums_1.OpType.AssetApprove].includes(type)) {
                if (!("amount" in payload)) {
                    return createInvalidResult(payload, "amount", "Amount is required for transfer and approve operations");
                }
                if (payload.amount < 0) {
                    return createInvalidResult(payload, "amount", "Amount cannot be negative");
                }
            }
            if (!(0, hex_1.isHex)(payload.asset_id)) {
                return createInvalidResult(payload, "asset_id", "Invalid asset ID");
            }
            if (type === enums_1.OpType.AssetApprove) {
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
            if (type === enums_1.OpType.LogicDeploy) {
                if (!("manifest" in payload)) {
                    return createInvalidResult(payload, "manifest", "Manifest is required for logic deploy operation");
                }
                if (!(0, hex_1.isHex)(payload.manifest)) {
                    return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
                }
            }
            if (type !== enums_1.OpType.LogicDeploy || type === enums_1.OpType.LogicEnlist) {
                if (!("logic_id" in payload)) {
                    return createInvalidResult(payload, "logic_id", "Logic ID is required");
                }
            }
            if ("calldata" in payload && !(0, hex_1.isHex)(payload.calldata)) {
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
    [enums_1.OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [enums_1.OpType.AssetCreate]: createAssetCreateDescriptor(),
    [enums_1.OpType.AssetMint]: createAssetSupplyDescriptorFor(enums_1.OpType.AssetMint),
    [enums_1.OpType.AssetBurn]: createAssetSupplyDescriptorFor(enums_1.OpType.AssetBurn),
    [enums_1.OpType.AssetTransfer]: createAssetActionDescriptor(enums_1.OpType.AssetTransfer),
    [enums_1.OpType.AssetApprove]: createAssetActionDescriptor(enums_1.OpType.AssetApprove),
    [enums_1.OpType.AssetRelease]: createAssetActionDescriptor(enums_1.OpType.AssetRelease),
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
const encodeOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    const polorizer = new js_polo_1.Polorizer();
    const data = (0, exports.transformPayload)(operation.type, operation.payload);
    polorizer.polorize(data, descriptor.schema());
    return { type: operation.type, payload: polorizer.bytes() };
};
exports.encodeOperation = encodeOperation;
/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
const isValidOperation = (operation) => {
    return (0, exports.validateOperation)(operation) == null;
};
exports.isValidOperation = isValidOperation;
/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
const validateOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    return descriptor.validator(operation.payload);
};
exports.validateOperation = validateOperation;
//# sourceMappingURL=operations.js.map