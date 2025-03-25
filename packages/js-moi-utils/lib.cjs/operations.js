"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOperation = exports.isValidOperation = exports.encodeOperation = exports.encodeOperationPayload = exports.getIxOperationDescriptor = exports.listIxOperationDescriptors = exports.isOperationType = void 0;
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_polo_1 = require("js-polo");
const enums_1 = require("./enums");
const errors_1 = require("./errors");
const hex_1 = require("./hex");
const createInvalidResult = (value, field, message) => {
    return { field, message, value: value[field] };
};
/**
 * Checks if a given operation is of a specified type.
 *
 * @param type - The type to check the operation against.
 * @param operation - The operation to check.
 * @returns True if the operation is of the specified type, otherwise false.
 */
const isOperationType = (type, operation) => {
    return operation.type === type;
};
exports.isOperationType = isOperationType;
const createParticipantCreateDescriptor = () => {
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            id: js_polo_1.schema.bytes,
            keys_payload: js_polo_1.schema.arrayOf(js_polo_1.schema.struct({
                public_key: js_polo_1.schema.bytes,
                weight: js_polo_1.schema.integer,
                signature_algorithm: js_polo_1.schema.integer,
            })),
            amount: js_polo_1.schema.integer,
        }),
        encode: ({ payload }) => {
            const poloKeysPayload = payload.keys_payload.map((payload) => ({
                ...payload,
                public_key: (0, hex_1.hexToBytes)(payload.public_key),
            }));
            return {
                ...payload,
                id: (0, hex_1.hexToBytes)(payload.id),
                keys_payload: poloKeysPayload,
            };
        },
        validator: (operation) => {
            const { payload } = operation;
            if (!(0, hex_1.isHex)(payload.id, 32)) {
                return createInvalidResult(payload, "id", "Invalid identifier");
            }
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            return null;
        },
    });
};
const createAccountInheritDescriptor = () => {
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            target_account: js_polo_1.schema.bytes,
            amount: js_polo_1.schema.integer,
            sub_account_index: js_polo_1.schema.integer,
        }),
        encode: ({ payload }) => ({
            ...payload,
            target_account: (0, hex_1.hexToBytes)(payload.target_account),
        }),
        validator: (operation) => {
            const { payload } = operation;
            if (!(0, hex_1.isHex)(payload.target_account, 32)) {
                return createInvalidResult(payload, "target_account", "Invalid identifier");
            }
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            if (typeof payload.sub_account_index !== "number") {
                return createInvalidResult(payload, "sub_account_index", "Sub account index must be a number");
            }
            return null;
        },
    });
};
const createAssetCreateDescriptor = () => {
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            symbol: js_polo_1.schema.string,
            supply: js_polo_1.schema.integer,
            standard: js_polo_1.schema.integer,
            dimension: js_polo_1.schema.integer,
            is_stateful: js_polo_1.schema.boolean,
            is_logical: js_polo_1.schema.boolean,
            logic_payload: js_polo_1.schema.struct({
                manifest: js_polo_1.schema.bytes,
                logic_id: js_polo_1.schema.string,
                callsite: js_polo_1.schema.string,
                calldata: js_polo_1.schema.bytes,
                interface: js_polo_1.schema.map({ keys: js_polo_1.schema.string, values: js_polo_1.schema.string }),
            }),
        }),
        validator: (operation) => {
            const { payload } = operation;
            if (payload.supply < 0) {
                return createInvalidResult(payload, "supply", "Supply cannot be negative");
            }
            if (!(payload.standard in enums_1.AssetStandard)) {
                return createInvalidResult(payload, "standard", "Invalid asset standard");
            }
            if (payload.dimension && payload.dimension < 0) {
                return createInvalidResult(payload, "dimension", "Dimension cannot be negative");
            }
            if (typeof payload.symbol !== "string") {
                return createInvalidResult(payload, "symbol", "Symbol must be a string");
            }
            return null;
        },
    });
};
const createAccountConfigureDescriptor = () => {
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            add: js_polo_1.schema.arrayOf(js_polo_1.schema.struct({
                public_key: js_polo_1.schema.bytes,
                weight: js_polo_1.schema.integer,
                signature_algorithm: js_polo_1.schema.integer,
            })),
            revoke: js_polo_1.schema.arrayOf(js_polo_1.schema.struct({
                key_id: js_polo_1.schema.integer,
            })),
        }),
        validator: ({ payload }) => {
            if (payload.add == null && payload.revoke == null) {
                return createInvalidResult(payload, "add", "Either 'add' or 'revoke' field is required");
            }
            for (const key in payload) {
                const value = payload[key];
                if (Object.keys(value).length === 0) {
                    return createInvalidResult(payload, key, `At least value is required in ${key}`);
                }
            }
            if (payload.add != null) {
                for (const item of payload.add) {
                    if (item.weight == null) {
                        return createInvalidResult(item, "weight", "Weight is required");
                    }
                    if (item.weight < 0) {
                        return createInvalidResult(item, "weight", "Weight cannot be negative");
                    }
                    if (item.signature_algorithm == null) {
                        return createInvalidResult(item, "signature_algorithm", "Signature algorithm is required");
                    }
                }
            }
            if (payload.revoke != null) {
                for (const item of payload.revoke) {
                    if (item.key_id == null) {
                        return createInvalidResult(item, "key_id", "Key ID is required");
                    }
                }
            }
            return null;
        },
        encode: ({ payload }) => {
            return {
                add: payload.add?.map((key) => ({
                    ...key,
                    public_key: key.public_key ? (0, hex_1.hexToBytes)(key.public_key) : undefined,
                })),
                revoke: payload.revoke,
            };
        },
    });
};
const createAssetSupplyDescriptorFor = () => {
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            asset_id: js_polo_1.schema.string,
            amount: js_polo_1.schema.integer,
        }),
        encode: ({ payload }) => ({
            ...payload,
            asset_id: (0, hex_1.hexToBytes)(payload.asset_id),
        }),
        validator: (operation) => {
            const { payload } = operation;
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
const createAssetActionDescriptor = () => {
    const validateAmount = (payload) => {
        if (payload.amount == null) {
            return createInvalidResult(payload, "amount", "Amount is required for operation");
        }
        if (typeof payload.amount !== "number" || Number.isNaN(payload.amount)) {
            return createInvalidResult(payload, "amount", "Amount must be a number");
        }
        if (payload.amount <= 0) {
            return createInvalidResult(payload, "amount", "Amount cannot be greater than zero");
        }
        return null;
    };
    const validateTimestamp = (payload) => {
        if (payload.timestamp == null) {
            return createInvalidResult(payload, "timestamp", "Timestamp is required for approve operation");
        }
        if (typeof payload.timestamp !== "number" || Number.isNaN(payload.timestamp)) {
            return createInvalidResult(payload, "timestamp", "Timestamp must be a number");
        }
        if (payload.timestamp <= Date.now()) {
            return createInvalidResult(payload, "timestamp", "Timestamp must be of the future");
        }
        return null;
    };
    const validateBenefactor = (payload) => {
        if (payload.benefactor == null) {
            return createInvalidResult(payload, "benefactor", "Benefactor is required for release operation");
        }
        if (!(0, hex_1.isHex)(payload.benefactor, 32)) {
            return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
        }
        return null;
    };
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            benefactor: js_polo_1.schema.bytes,
            beneficiary: js_polo_1.schema.bytes,
            asset_id: js_polo_1.schema.string,
            amount: js_polo_1.schema.integer,
            timestamp: js_polo_1.schema.integer,
        }),
        encode: ({ payload }) => {
            // @ts-expect-error - This is a hack to fix the type of the payload
            const raw = {
                ...payload,
                asset_id: (0, hex_1.hexToBytes)(payload.asset_id),
                benefactor: "benefactor" in payload && (0, hex_1.isHex)(payload.benefactor, 32) ? (0, hex_1.hexToBytes)(payload.benefactor) : new Uint8Array(32),
                beneficiary: (0, hex_1.hexToBytes)(payload.beneficiary),
            };
            return raw;
        },
        validator: (operation) => {
            if (!operation.payload.asset_id) {
                return createInvalidResult(operation.payload, "asset_id", "Asset ID is required");
            }
            if (!(0, hex_1.isHex)(operation.payload.asset_id, 32)) {
                return createInvalidResult(operation.payload, "asset_id", "Invalid asset ID");
            }
            if (!(0, hex_1.isHex)(operation.payload.beneficiary, 32)) {
                return createInvalidResult(operation.payload, "beneficiary", "Invalid beneficiary address");
            }
            switch (true) {
                case (0, exports.isOperationType)(enums_1.OpType.AssetLockup, operation): {
                    return validateAmount(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetTransfer, operation): {
                    return validateAmount(operation.payload) ?? (operation.payload.benefactor != null ? validateBenefactor(operation.payload) : null);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetApprove, operation): {
                    return validateAmount(operation.payload) ?? validateTimestamp(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetRelease, operation): {
                    return validateAmount(operation.payload) ?? validateBenefactor(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetRevoke, operation): {
                    return null;
                }
                default: {
                    errors_1.ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, errors_1.ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};
const createLogicActionDescriptor = () => {
    const validateManifest = (payload) => {
        if (!payload.manifest) {
            return createInvalidResult(payload, "manifest", "Manifest is required");
        }
        if (!(0, hex_1.isHex)(payload.manifest)) {
            return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
        }
        return null;
    };
    const validateCalldata = (payload) => {
        if (payload.calldata && !(0, hex_1.isHex)(payload.calldata)) {
            return createInvalidResult(payload, "calldata", "Calldata must be a hex string");
        }
        return null;
    };
    const validateLogicId = (payload) => {
        if (!payload.logic_id) {
            return createInvalidResult(payload, "logic_id", "Logic ID is required");
        }
        return null;
    };
    return Object.freeze({
        schema: js_polo_1.schema.struct({
            manifest: js_polo_1.schema.bytes,
            logic_id: js_polo_1.schema.bytes,
            callsite: js_polo_1.schema.string,
            calldata: js_polo_1.schema.bytes,
            interfaces: js_polo_1.schema.map({
                keys: js_polo_1.schema.string,
                values: js_polo_1.schema.string,
            }),
        }),
        encode: ({ payload }) => {
            if ("manifest" in payload) {
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
            return {
                ...payload,
                logic_id: new js_moi_identifiers_1.LogicId(payload.logic_id).toBytes(),
                calldata: payload.calldata != null ? (0, hex_1.hexToBytes)(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            };
        },
        validator: (operation) => {
            if (!operation.payload.callsite) {
                return createInvalidResult(operation.payload, "callsite", "Callsite is required");
            }
            switch (true) {
                case (0, exports.isOperationType)(enums_1.OpType.LogicDeploy, operation): {
                    return validateManifest(operation.payload) ?? validateCalldata(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.LogicInvoke, operation):
                case (0, exports.isOperationType)(enums_1.OpType.LogicEnlist, operation): {
                    return validateLogicId(operation.payload) ?? validateCalldata(operation.payload);
                }
                default: {
                    errors_1.ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, errors_1.ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};
const ixOpDescriptor = {
    [enums_1.OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [enums_1.OpType.AccountInherit]: createAccountInheritDescriptor(),
    [enums_1.OpType.AccountConfigure]: createAccountConfigureDescriptor(),
    [enums_1.OpType.AssetCreate]: createAssetCreateDescriptor(),
    [enums_1.OpType.AssetMint]: createAssetSupplyDescriptorFor(),
    [enums_1.OpType.AssetBurn]: createAssetSupplyDescriptorFor(),
    [enums_1.OpType.AssetTransfer]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetApprove]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetRelease]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetRevoke]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetLockup]: createAssetActionDescriptor(),
    [enums_1.OpType.LogicDeploy]: createLogicActionDescriptor(),
    [enums_1.OpType.LogicInvoke]: createLogicActionDescriptor(),
    [enums_1.OpType.LogicEnlist]: createLogicActionDescriptor(),
};
/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
const listIxOperationDescriptors = () => {
    const list = Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type), descriptor: descriptor };
    });
    return list;
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
const encodeOperationPayload = (operation) => {
    const descriptor = (0, exports.getIxOperationDescriptor)(operation.type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }
    return descriptor.encode?.(operation) ?? operation.payload;
};
exports.encodeOperationPayload = encodeOperationPayload;
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
    const data = (0, exports.encodeOperationPayload)(operation);
    polorizer.polorize(data, descriptor.schema);
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
    try {
        return (0, exports.validateOperation)(operation) == null;
    }
    catch {
        return false;
    }
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
    return descriptor.validator(operation);
};
exports.validateOperation = validateOperation;
//# sourceMappingURL=operations.js.map