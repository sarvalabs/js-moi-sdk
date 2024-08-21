"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
const js_polo_1 = require("js-polo");
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
        case js_moi_utils_1.TxType.ASSET_CREATE:
            return { ...payload };
        case js_moi_utils_1.TxType.ASSET_MINT:
        case js_moi_utils_1.TxType.ASSET_BURN: {
            const supplyPayload = payload;
            return {
                ...supplyPayload,
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(supplyPayload.asset_id),
            };
        }
        case js_moi_utils_1.TxType.ASSET_TRANSFER: {
            const actionPayload = payload;
            return {
                ...actionPayload,
                benefactor: (0, js_moi_utils_1.hexToBytes)(actionPayload.benefactor ?? js_moi_constants_1.ZERO_ADDRESS),
                beneficiary: (0, js_moi_utils_1.hexToBytes)(actionPayload.beneficiary),
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(actionPayload.asset_id),
            };
        }
        case js_moi_utils_1.TxType.LOGIC_DEPLOY:
            return { ...payload };
        case js_moi_utils_1.TxType.LOGIC_INVOKE:
        case js_moi_utils_1.TxType.LOGIC_ENLIST: {
            const logicPayload = payload;
            return {
                ...logicPayload,
                logic_id: (0, js_moi_utils_1.trimHexPrefix)(logicPayload.logic_id),
            };
        }
        default:
            throw new Error(`Unsupported transaction type: ${txType}`);
    }
};
/**
 * Processes the interaction object to extract and consolidate asset funds from
 * transactions and asset funds.
 *
 * @param {InteractionObject} ixObject - The interaction object containing transactions and asset funds.
 * @returns {ProcessedIxAssetFund[]} - The consolidated list of processed asset funds.
 */
const processFunds = (ixObject) => {
    const assetFunds = new Map();
    ixObject.transactions.forEach(transaction => {
        switch (transaction.type) {
            case js_moi_utils_1.TxType.ASSET_TRANSFER:
            case js_moi_utils_1.TxType.ASSET_MINT:
            case js_moi_utils_1.TxType.ASSET_BURN: {
                const payload = transaction.payload;
                const amount = assetFunds.get(payload.asset_id) ?? 0;
                if (typeof payload.amount === "bigint" || typeof amount === "bigint") {
                    assetFunds.set((0, js_moi_utils_1.trimHexPrefix)(payload.asset_id), BigInt(payload.amount) + BigInt(amount));
                    return;
                }
                assetFunds.set((0, js_moi_utils_1.trimHexPrefix)(payload.asset_id), Number(payload.amount) + Number(amount));
            }
        }
    });
    if (ixObject.funds != null) {
        // Add additional asset funds to the list if not present
        ixObject.funds.forEach(assetFund => {
            if (!assetFunds.has((0, js_moi_utils_1.trimHexPrefix)(assetFund.asset_id))) {
                assetFunds.set((0, js_moi_utils_1.trimHexPrefix)(assetFund.asset_id), assetFund.amount);
            }
        });
    }
    return Array.from(assetFunds, ([asset_id, amount]) => ({ asset_id, amount }));
};
/**
 * Processes a series of transactions and returns an array of processed participants.
 * Each participant is derived based on the type of transaction and its associated payload.
 *
 * @param {IxTransaction[]} steps - The array of transaction steps to process.
 * @returns {ProcessedIxParticipant[]} - The array of processed participants.
 * @throws {Error} - Throws an error if an unsupported transaction type is encountered.
 */
const processParticipants = (ixObject) => {
    const participants = new Map();
    // Add sender to participants
    participants.set((0, js_moi_utils_1.trimHexPrefix)(ixObject.sender), {
        address: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
        lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
    });
    // Add payer if it exists
    if (ixObject.payer != null) {
        participants.set((0, js_moi_utils_1.trimHexPrefix)(ixObject.payer), {
            address: (0, js_moi_utils_1.hexToBytes)(ixObject.payer),
            lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
        });
    }
    // Process transactions and add participants
    ixObject.transactions.forEach((transaction) => {
        switch (transaction.type) {
            case js_moi_utils_1.TxType.ASSET_CREATE:
                break;
            case js_moi_utils_1.TxType.ASSET_MINT:
            case js_moi_utils_1.TxType.ASSET_BURN: {
                const assetSupplyPayload = transaction.payload;
                const address = (0, js_moi_utils_1.trimHexPrefix)(assetSupplyPayload.asset_id).slice(8);
                participants.set(address, {
                    address: (0, js_moi_utils_1.hexToBytes)(address),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.TxType.ASSET_TRANSFER: {
                const assetActionPayload = transaction.payload;
                participants.set(assetActionPayload.beneficiary, {
                    address: (0, js_moi_utils_1.hexToBytes)(assetActionPayload.beneficiary),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.TxType.LOGIC_DEPLOY:
                break;
            case js_moi_utils_1.TxType.LOGIC_ENLIST:
            case js_moi_utils_1.TxType.LOGIC_INVOKE: {
                const logicPayload = transaction.payload;
                const address = (0, js_moi_utils_1.trimHexPrefix)(logicPayload.logic_id).slice(6);
                participants.set(address, {
                    address: (0, js_moi_utils_1.hexToBytes)(address),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported Ix type", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
    });
    // Add additional participants if they exist
    if (ixObject.participants != null) {
        ixObject.participants.forEach((participant) => {
            const address = (0, js_moi_utils_1.trimHexPrefix)(participant.address);
            if (!participants.has(address)) {
                participants.set(address, {
                    address: (0, js_moi_utils_1.hexToBytes)(participant.address),
                    lock_type: participant.lock_type
                });
            }
        });
    }
    return Array.from(participants.values());
};
/**
 * Processes an array of transactions by serializing their payloads into byte form
 * and returns the processed transactions.
 *
 * @param {IxTransaction[]} transactions - Transactions to process.
 * @returns {ProcessedIxTransaction[]} - Processed transactions with serialized payloads.
 * @throws {Error} - If the payload is missing or transaction type is unsupported.
 */
const processTransactions = (transactions) => {
    return transactions.map(transaction => {
        if (!transaction.payload) {
            js_moi_utils_1.ErrorUtils.throwError("Payload is missing!", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
        }
        const payload = processPayload(transaction.type, transaction.payload);
        const polorizer = new js_polo_1.Polorizer();
        switch (transaction.type) {
            case js_moi_utils_1.TxType.ASSET_TRANSFER:
                polorizer.polorize(payload, js_moi_utils_1.assetActionSchema);
                return { ...transaction, payload: polorizer.bytes() };
            case js_moi_utils_1.TxType.ASSET_CREATE:
                polorizer.polorize(payload, js_moi_utils_1.assetCreateSchema);
                return { ...transaction, payload: polorizer.bytes() };
            case js_moi_utils_1.TxType.ASSET_MINT:
            case js_moi_utils_1.TxType.ASSET_BURN:
                polorizer.polorize(payload, js_moi_utils_1.assetSupplySchema);
                return { ...transaction, payload: polorizer.bytes() };
            case js_moi_utils_1.TxType.LOGIC_DEPLOY:
            case js_moi_utils_1.TxType.LOGIC_INVOKE:
            case js_moi_utils_1.TxType.LOGIC_ENLIST:
                polorizer.polorize(payload, js_moi_utils_1.logicSchema);
                return { ...transaction, payload: polorizer.bytes() };
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported interaction type!", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
    });
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {InteractionObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        return {
            sender: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
            payer: (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS),
            nonce: ixObject.nonce,
            fuel_price: ixObject.fuel_price,
            fuel_limit: ixObject.fuel_limit,
            funds: processFunds(ixObject),
            transactions: processTransactions(ixObject.transactions),
            participants: processParticipants(ixObject),
        };
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
const serializeIxObject = (ixObject) => {
    try {
        const processedIxObject = processIxObject(ixObject);
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(processedIxObject, js_moi_utils_1.ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;
//# sourceMappingURL=serializer.js.map