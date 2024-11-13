import { ErrorCode, ErrorUtils, OpType, participantCreateSchema, assetActionSchema, assetCreateSchema, assetSupplySchema, bytesToHex, hexToBytes, logicSchema, toQuantity, trimHexPrefix } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { ZERO_ADDRESS } from "js-moi-constants";
/**
 * Validates the payload for PARTICIPANT_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateParticipantCreatePayload = (payload) => {
    if ('address' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid participant create payload");
};
/**
 * Validates the payload for ASSET_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetCreatePayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetCreatePayload = (payload) => {
    if ('symbol' in payload && 'supply' in payload && 'standard' in payload) {
        return payload;
    }
    throw new Error("Invalid asset create payload");
};
/**
 * Validates the payload for ASSET_MINT and ASSET_BURN operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetSupplyPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetSupplyPayload = (payload) => {
    if ('asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid asset mint or burn payload");
};
/**
 * Validates the payload for ASSET_TRANSFER operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetTransferPayload = (payload) => {
    if ('beneficiary' in payload && 'asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid asset transfer payload");
};
/**
 * Validates the payload for LOGIC_DEPLOY operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicDeployPayload = (payload) => {
    if ('manifest' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid logic deploy payload");
};
/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicPayload = (payload) => {
    if ('logic_id' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid logic invoke or enlist payload");
};
/**
 * Processes the payload based on the operation type.
 *
 * @param {OpType} txType - The operation type.
 * @param {OperationPayload} payload - The operation payload.
 * @returns {OperationPayload} - The processed operation payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
const processPayload = (txType, payload) => {
    switch (txType) {
        case OpType.PARTICIPANT_CREATE: {
            const participantPayload = validateParticipantCreatePayload(payload);
            return {
                ...participantPayload,
                address: hexToBytes(participantPayload.address),
            };
        }
        case OpType.ASSET_CREATE: {
            const createPayload = validateAssetCreatePayload(payload);
            return { ...createPayload };
        }
        case OpType.ASSET_MINT:
        case OpType.ASSET_BURN: {
            const supplyPayload = validateAssetSupplyPayload(payload);
            return {
                ...supplyPayload,
                asset_id: trimHexPrefix(supplyPayload.asset_id),
            };
        }
        case OpType.ASSET_TRANSFER: {
            const actionPayload = validateAssetTransferPayload(payload);
            return {
                ...actionPayload,
                benefactor: hexToBytes(actionPayload.benefactor ?? ZERO_ADDRESS),
                beneficiary: hexToBytes(actionPayload.beneficiary),
                asset_id: trimHexPrefix(actionPayload.asset_id),
            };
        }
        case OpType.LOGIC_DEPLOY: {
            const logicPayload = validateLogicDeployPayload(payload);
            return {
                manifest: hexToBytes(logicPayload.manifest),
                callsite: logicPayload.callsite,
                calldata: hexToBytes(logicPayload.calldata),
            };
        }
        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST: {
            const logicPayload = validateLogicPayload(payload);
            return {
                logic_id: trimHexPrefix(logicPayload.logic_id),
                callsite: logicPayload.callsite,
                calldata: hexToBytes(logicPayload.calldata),
            };
        }
        default:
            ErrorUtils.throwError(`Unsupported operation type: ${txType}`, ErrorCode.UNSUPPORTED_OPERATION);
    }
};
/**
 * Serializes the payload of a operation based on its type.
 * This function polorizes (serializes) the payload using the appropriate schema
 * based on the operation type and returns it as a byte array.
 *
 * @param {OpType} txType - The type of the operation (e.g., ASSET_TRANSFER, ASSET_CREATE).
 * @param {OperationPayload} payload - The payload of the operation to be serialized.
 * @returns {Uint8Array} - A serialized byte array representing the processed payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
export const serializePayload = (txType, payload) => {
    const polorizer = new Polorizer();
    const processedPayload = processPayload(txType, payload);
    switch (txType) {
        case OpType.PARTICIPANT_CREATE:
            polorizer.polorize(processedPayload, participantCreateSchema);
            return polorizer.bytes();
        case OpType.ASSET_TRANSFER:
            polorizer.polorize(processedPayload, assetActionSchema);
            return polorizer.bytes();
        case OpType.ASSET_CREATE:
            polorizer.polorize(processedPayload, assetCreateSchema);
            return polorizer.bytes();
        case OpType.ASSET_MINT:
        case OpType.ASSET_BURN:
            polorizer.polorize(processedPayload, assetSupplySchema);
            return polorizer.bytes();
        case OpType.LOGIC_DEPLOY:
        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST:
            polorizer.polorize(processedPayload, logicSchema);
            return polorizer.bytes();
        default:
            ErrorUtils.throwError(`Unsupported operation type: ${txType}`, ErrorCode.UNSUPPORTED_OPERATION);
    }
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
export const processIxObject = (ixObject) => {
    try {
        return {
            nonce: toQuantity(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: toQuantity(ixObject.fuel_price),
            fuel_limit: toQuantity(ixObject.fuel_limit),
            funds: [],
            ix_operations: ixObject.ix_operations.map(operation => ({
                ...operation,
                payload: "0x" + bytesToHex(serializePayload(operation.type, operation.payload)),
            })),
            participants: []
        };
    }
    catch (err) {
        ErrorUtils.throwError("Failed to process interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=interaction.js.map