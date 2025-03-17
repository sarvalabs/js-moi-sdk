import { LogicId } from "js-moi-identifiers";
import { Polorizer, type Schema, schema } from "js-polo";
import { AssetStandard, OpType } from "./enums";
import { ErrorCode, ErrorUtils } from "./errors";
import { hexToBytes, isHex } from "./hex";
import type { IxOperation, RawIxOperation, RawIxOperationPayload } from "./types/ix-operation";

export interface IxOperationDescriptor<TOpType extends OpType> {
    /**
     * Returns the POLO schema for the operation payload.
     *
     * @returns Returns the POLO schema for the operation payload.
     */
    schema: Schema;
    /**
     * Validates the operation payload.
     *
     * @param payload Operation payload
     * @returns Returns the validation result.
     */
    validator: (operation: IxOperation<TOpType>) => ReturnType<typeof createInvalidResult> | null;
    /**
     * Transforms the operation payload to a format that can be serialized to POLO.
     *
     * @param payload Operation payload
     * @returns Returns the transformed operation payload.
     */
    encode?: (payload: IxOperation<TOpType>) => RawIxOperationPayload<TOpType>;
}

type IxOperationDescriptorLookup = {
    [key in OpType]?: IxOperationDescriptor<key>;
};

type AssetSupplyOpType = OpType.AssetMint | OpType.AssetBurn;

const createInvalidResult = <T extends Record<any, any>>(value: T, field: keyof T, message: string) => {
    return { field, message, value: value[field] };
};

/**
 * Checks if a given operation is of a specified type.
 *
 * @param type - The type to check the operation against.
 * @param operation - The operation to check.
 * @returns True if the operation is of the specified type, otherwise false.
 */
export const isOperationType = <TOpType extends OpType>(type: TOpType, operation: IxOperation<OpType>): operation is IxOperation<TOpType> => {
    return operation.type === type;
};

const createParticipantCreateDescriptor = () => {
    return Object.freeze<IxOperationDescriptor<OpType.ParticipantCreate>>({
        schema: schema.struct({
            id: schema.bytes,
            keys_payload: schema.arrayOf(
                schema.struct({
                    public_key: schema.bytes,
                    weight: schema.integer,
                    signature_algorithm: schema.integer,
                })
            ),
            amount: schema.integer,
        }),

        encode: ({ payload }) => {
            const poloKeysPayload = payload.keys_payload.map((payload) => ({
                ...payload,
                public_key: hexToBytes(payload.public_key),
            }));

            return {
                ...payload,
                id: hexToBytes(payload.id),
                keys_payload: poloKeysPayload,
            };
        },

        validator: (operation) => {
            const { payload } = operation;
            if (!isHex(payload.id, 32)) {
                return createInvalidResult(payload, "id", "Invalid identifier");
            }

            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }

            return null;
        },
    });
};

const createAssetCreateDescriptor = () => {
    return Object.freeze<IxOperationDescriptor<OpType.AssetCreate>>({
        schema: schema.struct({
            symbol: schema.string,
            supply: schema.integer,
            standard: schema.integer,
            dimension: schema.integer,
            is_stateful: schema.boolean,
            is_logical: schema.boolean,
            logic_payload: schema.struct({
                manifest: schema.bytes,
                logic_id: schema.string,
                callsite: schema.string,
                calldata: schema.bytes,
                interface: schema.map({ keys: schema.string, values: schema.string }),
            }),
        }),

        validator: (operation) => {
            const { payload } = operation;

            if (payload.supply < 0) {
                return createInvalidResult(payload, "supply", "Supply cannot be negative");
            }

            if (!(payload.standard in AssetStandard)) {
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
    return Object.freeze<IxOperationDescriptor<OpType.AccountConfigure>>({
        schema: schema.struct({
            add: schema.arrayOf(
                schema.struct({
                    public_key: schema.bytes,
                    weight: schema.integer,
                    signature_algorithm: schema.integer,
                })
            ),
            revoke: schema.arrayOf(
                schema.struct({
                    key_id: schema.integer,
                })
            ),
        }),

        validator: ({ payload }) => {
            console.log(payload);
            if (payload.add == null && payload.revoke == null) {
                return createInvalidResult(payload, "add", "Either 'add' or 'revoke' field is required");
            }

            for (const key in payload) {
                const value = payload[key];

                if (Object.keys(value).length === 0) {
                    return createInvalidResult(payload, key as keyof typeof payload, `At least value is required in ${key}`);
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

        encode: ({ payload }): RawIxOperationPayload<OpType.AccountConfigure> => {
            return {
                add: payload.add?.map((key) => ({
                    ...key,
                    public_key: key.public_key ? hexToBytes(key.public_key) : undefined,
                })),
                revoke: payload.revoke,
            };
        },
    });
};

const createAssetSupplyDescriptorFor = () => {
    return Object.freeze<IxOperationDescriptor<AssetSupplyOpType>>({
        schema: schema.struct({
            asset_id: schema.string,
            amount: schema.integer,
        }),

        encode: ({ payload }) => ({
            ...payload,
            asset_id: hexToBytes(payload.asset_id),
        }),

        validator: (operation) => {
            const { payload } = operation;

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

type AssetActionOpType = OpType.AssetTransfer | OpType.AssetApprove | OpType.AssetRelease | OpType.AssetLockup | OpType.AssetRevoke;

const createAssetActionDescriptor = <TOpType extends AssetActionOpType>() => {
    const validateAmount = (payload: Partial<Record<"amount", number>>) => {
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

    const validateTimestamp = (payload: Partial<Record<"timestamp", number>>) => {
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

    const validateBenefactor = (payload: Partial<Record<"benefactor", string>>) => {
        if (payload.benefactor == null) {
            return createInvalidResult(payload, "benefactor", "Benefactor is required for release operation");
        }

        if (!isHex(payload.benefactor, 32)) {
            return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
        }

        return null;
    };

    return Object.freeze<IxOperationDescriptor<TOpType>>({
        schema: schema.struct({
            benefactor: schema.bytes,
            beneficiary: schema.bytes,
            asset_id: schema.string,
            amount: schema.integer,
            timestamp: schema.integer,
        }),

        encode: ({ payload }) => {
            // @ts-expect-error - This is a hack to fix the type of the payload
            const raw: RawIxOperationPayload<TOpType> = {
                ...payload,
                asset_id: hexToBytes(payload.asset_id),
                benefactor: "benefactor" in payload && isHex(payload.benefactor!, 32) ? hexToBytes(payload.benefactor) : new Uint8Array(32),
                beneficiary: hexToBytes(payload.beneficiary),
            };

            return raw;
        },

        validator: (operation: IxOperation<AssetActionOpType>) => {
            if (!operation.payload.asset_id) {
                return createInvalidResult(operation.payload, "asset_id", "Asset ID is required");
            }

            if (!isHex(operation.payload.asset_id, 32)) {
                return createInvalidResult(operation.payload, "asset_id", "Invalid asset ID");
            }

            if (!isHex(operation.payload.beneficiary, 32)) {
                return createInvalidResult(operation.payload, "beneficiary", "Invalid beneficiary address");
            }

            switch (true) {
                case isOperationType(OpType.AssetLockup, operation): {
                    return validateAmount(operation.payload);
                }

                case isOperationType(OpType.AssetTransfer, operation): {
                    return validateAmount(operation.payload) ?? (operation.payload.benefactor != null ? validateBenefactor(operation.payload) : null);
                }

                case isOperationType(OpType.AssetApprove, operation): {
                    return validateAmount(operation.payload) ?? validateTimestamp(operation.payload);
                }

                case isOperationType(OpType.AssetRelease, operation): {
                    return validateAmount(operation.payload) ?? validateBenefactor(operation.payload);
                }

                case isOperationType(OpType.AssetRevoke, operation): {
                    return null;
                }

                default: {
                    ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};

type LogicActionOpType = OpType.LogicDeploy | OpType.LogicInvoke | OpType.LogicEnlist;

const createLogicActionDescriptor = <T extends LogicActionOpType>() => {
    const validateManifest = (payload: Partial<Record<"manifest", string>>) => {
        if (!payload.manifest) {
            return createInvalidResult(payload, "manifest", "Manifest is required");
        }

        if (!isHex(payload.manifest)) {
            return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
        }

        return null;
    };

    const validateCalldata = (payload: Partial<Record<"calldata", string>>) => {
        if (payload.calldata && !isHex(payload.calldata)) {
            return createInvalidResult(payload, "calldata", "Calldata must be a hex string");
        }

        return null;
    };

    const validateLogicId = (payload: Partial<Record<"logic_id", string>>) => {
        if (!payload.logic_id) {
            return createInvalidResult(payload, "logic_id", "Logic ID is required");
        }

        return null;
    };

    return Object.freeze<IxOperationDescriptor<T>>({
        schema: schema.struct({
            manifest: schema.bytes,
            logic_id: schema.bytes,
            callsite: schema.string,
            calldata: schema.bytes,
            interfaces: schema.map({
                keys: schema.string,
                values: schema.string,
            }),
        }),

        encode: ({ payload }) => {
            if ("manifest" in payload) {
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

            return {
                ...payload,
                logic_id: new LogicId(payload.logic_id).toBytes(),
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            } as any;
        },

        validator: (operation) => {
            if (!operation.payload.callsite) {
                return createInvalidResult(operation.payload, "callsite", "Callsite is required");
            }

            switch (true) {
                case isOperationType(OpType.LogicDeploy, operation): {
                    return validateManifest(operation.payload) ?? validateCalldata(operation.payload);
                }

                case isOperationType(OpType.LogicInvoke, operation):
                case isOperationType(OpType.LogicEnlist, operation): {
                    return validateLogicId(operation.payload) ?? validateCalldata(operation.payload);
                }

                default: {
                    ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};

const ixOpDescriptor: IxOperationDescriptorLookup = {
    [OpType.ParticipantCreate]: createParticipantCreateDescriptor(),

    [OpType.AccountConfigure]: createAccountConfigureDescriptor(),

    [OpType.AssetCreate]: createAssetCreateDescriptor(),
    [OpType.AssetMint]: createAssetSupplyDescriptorFor(),
    [OpType.AssetBurn]: createAssetSupplyDescriptorFor(),
    [OpType.AssetTransfer]: createAssetActionDescriptor(),
    [OpType.AssetApprove]: createAssetActionDescriptor(),
    [OpType.AssetRelease]: createAssetActionDescriptor(),
    [OpType.AssetRevoke]: createAssetActionDescriptor(),
    [OpType.AssetLockup]: createAssetActionDescriptor(),

    [OpType.LogicDeploy]: createLogicActionDescriptor(),
    [OpType.LogicInvoke]: createLogicActionDescriptor(),
    [OpType.LogicEnlist]: createLogicActionDescriptor(),
};

type OperationDescriptorRecord<T extends OpType = OpType> = {
    type: T;
    descriptor: IxOperationDescriptor<T>;
};

/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
export const listIxOperationDescriptors = (): OperationDescriptorRecord[] => {
    const list: OperationDescriptorRecord[] = Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type) as OpType, descriptor: descriptor as IxOperationDescriptor<OpType> };
    });

    return list;
};

/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
export const getIxOperationDescriptor = <TOpType extends OpType>(type: TOpType): IxOperationDescriptor<TOpType> | null => ixOpDescriptor[type] ?? null;

/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
export const encodeOperationPayload = <TOpType extends OpType>(operation: IxOperation<TOpType>): RawIxOperationPayload<TOpType> => {
    const descriptor = getIxOperationDescriptor(operation.type);

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }

    return descriptor.encode?.(operation) ?? (operation.payload as unknown as RawIxOperationPayload<TOpType>);
};

/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export const encodeOperation = <TOpType extends OpType>(operation: IxOperation<TOpType>): RawIxOperation => {
    const descriptor = ixOpDescriptor[operation.type];

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }

    const polorizer = new Polorizer();
    const data = encodeOperationPayload(operation);

    polorizer.polorize(data, descriptor.schema);

    return { type: operation.type, payload: polorizer.bytes() };
};

/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
export const isValidOperation = <TOpType extends OpType>(operation: IxOperation<TOpType>): boolean => {
    try {
        return validateOperation(operation) == null;
    } catch {
        return false;
    }
};

/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
export const validateOperation = <TOpType extends OpType>(operation: IxOperation<TOpType>): ReturnType<IxOperationDescriptor<TOpType>["validator"]> => {
    const descriptor = ixOpDescriptor[operation.type];

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }

    return descriptor.validator(operation);
};
