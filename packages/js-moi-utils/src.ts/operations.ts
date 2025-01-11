import { Polorizer } from "js-polo";
import { polo, type PoloSchema } from "polo-schema";
import { OpType } from "./enums";
import { hexToBytes } from "./hex";
import type { Operation } from "./types/ix-operation";
import type { OperationPayload } from "./types/ix-payload";

export type IxOperationValidationResult = { reason: string; field: string; value: any } | null;

export interface IxOperationDescriptor<TOpType extends OpType> {
    schema: () => PoloSchema;
    serializer: (payload: OperationPayload<TOpType>) => Uint8Array;
    validator: (payload: OperationPayload<TOpType>) => IxOperationValidationResult;
}

type IxOperationDescriptorLookup = {
    [key in OpType]?: IxOperationDescriptor<key>;
};

type AssetSupplyOpType = OpType.AssetMint | OpType.AssetBurn;

const encodeToPolo = (type: OpType, data: any): Uint8Array => {
    const schema = ixOpDescriptor[type]?.schema();

    if (schema == null) {
        throw new Error(`Schema for operation type "${type}" is not registered`);
    }

    const polorizer = new Polorizer();
    polorizer.polorize(data, schema);

    return polorizer.bytes();
};

const createParticipantCreateDescriptor = () => {
    return Object.freeze<IxOperationDescriptor<OpType.ParticipantCreate>>({
        schema: () => {
            return polo.struct({
                address: polo.bytes,
                keys_payload: polo.arrayOf(
                    polo.struct({
                        public_key: polo.bytes,
                        weight: polo.integer,
                        signature_algorithm: polo.integer,
                    })
                ),
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
    return Object.freeze<IxOperationDescriptor<OpType.AssetCreate>>({
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

const createAssetSupplyDescriptorFor = (type: AssetSupplyOpType) => {
    return Object.freeze<IxOperationDescriptor<AssetSupplyOpType>>({
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
    return Object.freeze<IxOperationDescriptor<OpType.AssetTransfer>>({
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

type LogicActionOpType = OpType.LogicDeploy | OpType.LogicInvoke | OpType.LogicEnlist;

const createLogicActionDescriptor = (type: LogicActionOpType) => {
    return Object.freeze<IxOperationDescriptor<LogicActionOpType>>({
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

const ixOpDescriptor: IxOperationDescriptorLookup = {
    [OpType.ParticipantCreate]: createParticipantCreateDescriptor(),

    [OpType.AssetCreate]: createAssetCreateDescriptor(),
    [OpType.AssetMint]: createAssetSupplyDescriptorFor(OpType.AssetMint),
    [OpType.AssetBurn]: createAssetSupplyDescriptorFor(OpType.AssetBurn),
    [OpType.AssetTransfer]: createAssetActionDescriptor(),

    [OpType.LogicDeploy]: createLogicActionDescriptor(OpType.LogicDeploy),
    [OpType.LogicInvoke]: createLogicActionDescriptor(OpType.LogicInvoke),
    [OpType.LogicEnlist]: createLogicActionDescriptor(OpType.LogicEnlist),
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
    return Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type) as OpType, descriptor };
    });
};

/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
export const getIxOperationDescriptor = <TOpType extends OpType>(type: TOpType): IxOperationDescriptor<TOpType> | null => ixOpDescriptor[type] ?? null;

/**
 * Encodes an operation to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded operation as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export const encodeIxOperationToPolo = <TOpType extends OpType>(operation: Operation<TOpType>): Uint8Array => {
    const descriptor = getIxOperationDescriptor(operation.type);

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }

    return descriptor.serializer(operation.payload);
};
