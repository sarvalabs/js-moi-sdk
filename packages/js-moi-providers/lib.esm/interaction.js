import { ErrorCode, ErrorUtils, TxType, assetActionSchema, assetCreateSchema, assetSupplySchema, bytesToHex, hexToBytes, logicSchema, toQuantity, trimHexPrefix } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { ZERO_ADDRESS } from "js-moi-constants";
/**
 * Validates the payload for ASSET_CREATE transaction type.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {AssetCreatePayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetCreatePayload = (payload) => {
    if ('symbol' in payload && 'supply' in payload && 'standard' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for ASSET_CREATE");
};
/**
 * Validates the payload for ASSET_MINT and ASSET_BURN transaction types.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {AssetSupplyPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetSupplyPayload = (payload) => {
    if ('asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for ASSET_MINT/ASSET_BURN");
};
/**
 * Validates the payload for ASSET_TRANSFER transaction type.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetTransferPayload = (payload) => {
    if ('beneficiary' in payload && 'asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for ASSET_TRANSFER");
};
/**
 * Validates the payload for LOGIC_DEPLOY transaction type.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicDeployPayload = (payload) => {
    if ('manifest' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for LOGIC_DEPLOY");
};
/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST transaction types.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicPayload = (payload) => {
    if ('logic_id' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for LOGIC_INVOKE/LOGIC_ENLIST");
};
/**
 * Processes the payload based on the transaction type.
 *
 * @param {TxType} txType - The transaction type.
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {TransactionPayload} - The processed transaction payload.
 * @throws {Error} - Throws an error if the transaction type is unsupported.
 */
const processPayload = (txType, payload) => {
    switch (txType) {
        case TxType.ASSET_CREATE: {
            const createPayload = validateAssetCreatePayload(payload);
            return { ...createPayload };
        }
        case TxType.ASSET_MINT:
        case TxType.ASSET_BURN: {
            const supplyPayload = validateAssetSupplyPayload(payload);
            return {
                ...supplyPayload,
                asset_id: trimHexPrefix(supplyPayload.asset_id),
            };
        }
        case TxType.ASSET_TRANSFER: {
            const actionPayload = validateAssetTransferPayload(payload);
            return {
                ...actionPayload,
                benefactor: hexToBytes(actionPayload.benefactor ?? ZERO_ADDRESS),
                beneficiary: hexToBytes(actionPayload.beneficiary),
                asset_id: trimHexPrefix(actionPayload.asset_id),
            };
        }
        case TxType.LOGIC_DEPLOY: {
            const logicPayload = validateLogicDeployPayload(payload);
            return {
                manifest: hexToBytes(logicPayload.manifest),
                callsite: logicPayload.callsite,
                calldata: hexToBytes(logicPayload.calldata),
            };
        }
        case TxType.LOGIC_INVOKE:
        case TxType.LOGIC_ENLIST: {
            const logicPayload = validateLogicPayload(payload);
            return {
                logic_id: trimHexPrefix(logicPayload.logic_id),
                callsite: logicPayload.callsite,
                calldata: hexToBytes(logicPayload.calldata),
            };
        }
        default:
            ErrorUtils.throwError(`Unsupported transaction type: ${txType}`, ErrorCode.UNSUPPORTED_OPERATION);
    }
};
/**
 * Serializes the payload of a transaction based on its type.
 * This function polorizes (serializes) the payload using the appropriate schema
 * based on the transaction type and returns it as a byte array.
 *
 * @param {TxType} txType - The type of the transaction (e.g., ASSET_TRANSFER, ASSET_CREATE).
 * @param {TransactionPayload} payload - The payload of the transaction to be serialized.
 * @returns {Uint8Array} - A serialized byte array representing the processed payload.
 * @throws {Error} - Throws an error if the transaction type is unsupported.
 */
export const serializePayload = (txType, payload) => {
    const polorizer = new Polorizer();
    const processedPayload = processPayload(txType, payload);
    switch (txType) {
        case TxType.ASSET_TRANSFER:
            polorizer.polorize(processedPayload, assetActionSchema);
            return polorizer.bytes();
        case TxType.ASSET_CREATE:
            polorizer.polorize(processedPayload, assetCreateSchema);
            return polorizer.bytes();
        case TxType.ASSET_MINT:
        case TxType.ASSET_BURN:
            polorizer.polorize(processedPayload, assetSupplySchema);
            return polorizer.bytes();
        case TxType.LOGIC_DEPLOY:
        case TxType.LOGIC_INVOKE:
        case TxType.LOGIC_ENLIST:
            polorizer.polorize(processedPayload, logicSchema);
            return polorizer.bytes();
        default:
            ErrorUtils.throwError(`Unsupported transaction type: ${txType}`, ErrorCode.UNSUPPORTED_OPERATION);
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
            transactions: ixObject.transactions.map(transaction => ({
                ...transaction,
                payload: "0x" + bytesToHex(serializePayload(transaction.type, transaction.payload)),
            })),
            participants: []
        };
    }
    catch (err) {
        ErrorUtils.throwError("Failed to process interaction object", ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
//# sourceMappingURL=interaction.js.map