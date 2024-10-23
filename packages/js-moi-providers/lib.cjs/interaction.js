"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processIxObject = exports.serializePayload = exports.validateLogicPayload = exports.validateLogicDeployPayload = exports.validateAssetTransferPayload = exports.validateAssetSupplyPayload = exports.validateAssetCreatePayload = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const js_moi_constants_1 = require("js-moi-constants");
/**
 * Validates the payload for ASSET_CREATE transaction type.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {AssetCreatePayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateAssetCreatePayload = (payload) => {
    if ('symbol' in payload && 'supply' in payload && 'standard' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for ASSET_CREATE");
};
exports.validateAssetCreatePayload = validateAssetCreatePayload;
/**
 * Validates the payload for ASSET_MINT and ASSET_BURN transaction types.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {AssetSupplyPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateAssetSupplyPayload = (payload) => {
    if ('asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for ASSET_MINT/ASSET_BURN");
};
exports.validateAssetSupplyPayload = validateAssetSupplyPayload;
/**
 * Validates the payload for ASSET_TRANSFER transaction type.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateAssetTransferPayload = (payload) => {
    if ('beneficiary' in payload && 'asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for ASSET_TRANSFER");
};
exports.validateAssetTransferPayload = validateAssetTransferPayload;
/**
 * Validates the payload for LOGIC_DEPLOY transaction type.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateLogicDeployPayload = (payload) => {
    if ('manifest' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for LOGIC_DEPLOY");
};
exports.validateLogicDeployPayload = validateLogicDeployPayload;
/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST transaction types.
 *
 * @param {TransactionPayload} payload - The transaction payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateLogicPayload = (payload) => {
    if ('logic_id' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid payload for LOGIC_INVOKE/LOGIC_ENLIST");
};
exports.validateLogicPayload = validateLogicPayload;
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
        case js_moi_utils_1.TxType.ASSET_CREATE: {
            const createPayload = (0, exports.validateAssetCreatePayload)(payload);
            return { ...createPayload };
        }
        case js_moi_utils_1.TxType.ASSET_MINT:
        case js_moi_utils_1.TxType.ASSET_BURN: {
            const supplyPayload = (0, exports.validateAssetSupplyPayload)(payload);
            return {
                ...supplyPayload,
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(supplyPayload.asset_id),
            };
        }
        case js_moi_utils_1.TxType.ASSET_TRANSFER: {
            const actionPayload = (0, exports.validateAssetTransferPayload)(payload);
            return {
                ...actionPayload,
                benefactor: (0, js_moi_utils_1.hexToBytes)(actionPayload.benefactor ?? js_moi_constants_1.ZERO_ADDRESS),
                beneficiary: (0, js_moi_utils_1.hexToBytes)(actionPayload.beneficiary),
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(actionPayload.asset_id),
            };
        }
        case js_moi_utils_1.TxType.LOGIC_DEPLOY: {
            const logicPayload = (0, exports.validateLogicDeployPayload)(payload);
            return {
                manifest: (0, js_moi_utils_1.hexToBytes)(logicPayload.manifest),
                callsite: logicPayload.callsite,
                calldata: (0, js_moi_utils_1.hexToBytes)(logicPayload.calldata),
            };
        }
        case js_moi_utils_1.TxType.LOGIC_INVOKE:
        case js_moi_utils_1.TxType.LOGIC_ENLIST: {
            const logicPayload = (0, exports.validateLogicPayload)(payload);
            return {
                logic_id: (0, js_moi_utils_1.trimHexPrefix)(logicPayload.logic_id),
                callsite: logicPayload.callsite,
                calldata: (0, js_moi_utils_1.hexToBytes)(logicPayload.calldata),
            };
        }
        default:
            js_moi_utils_1.ErrorUtils.throwError(`Unsupported transaction type: ${txType}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
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
const serializePayload = (txType, payload) => {
    const polorizer = new js_polo_1.Polorizer();
    const processedPayload = processPayload(txType, payload);
    switch (txType) {
        case js_moi_utils_1.TxType.ASSET_TRANSFER:
            polorizer.polorize(processedPayload, js_moi_utils_1.assetActionSchema);
            return polorizer.bytes();
        case js_moi_utils_1.TxType.ASSET_CREATE:
            polorizer.polorize(processedPayload, js_moi_utils_1.assetCreateSchema);
            return polorizer.bytes();
        case js_moi_utils_1.TxType.ASSET_MINT:
        case js_moi_utils_1.TxType.ASSET_BURN:
            polorizer.polorize(processedPayload, js_moi_utils_1.assetSupplySchema);
            return polorizer.bytes();
        case js_moi_utils_1.TxType.LOGIC_DEPLOY:
        case js_moi_utils_1.TxType.LOGIC_INVOKE:
        case js_moi_utils_1.TxType.LOGIC_ENLIST:
            polorizer.polorize(processedPayload, js_moi_utils_1.logicSchema);
            return polorizer.bytes();
        default:
            js_moi_utils_1.ErrorUtils.throwError(`Unsupported transaction type: ${txType}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
};
exports.serializePayload = serializePayload;
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        return {
            nonce: (0, js_moi_utils_1.toQuantity)(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_price),
            fuel_limit: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_limit),
            funds: [],
            transactions: ixObject.transactions.map(transaction => ({
                ...transaction,
                payload: "0x" + (0, js_moi_utils_1.bytesToHex)((0, exports.serializePayload)(transaction.type, transaction.payload)),
            })),
            participants: []
        };
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.processIxObject = processIxObject;
//# sourceMappingURL=interaction.js.map