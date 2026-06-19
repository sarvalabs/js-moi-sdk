import { accountConfigureSchema, accountInheritSchema, assetActionSchema, assetCreateSchema, ErrorCode, ErrorUtils, hexToBytes, LockType, logicSchema, OpType, participantCreateSchema, toQuantity, trimHexPrefix, withHexPrefix } from "js-moi-utils";
import { ParticipantId, AssetId, Identifier, LogicId } from "js-moi-identifiers";
import { ZERO_ADDRESS, KMOI_ASSET_ID } from "js-moi-constants";
import { Polorizer } from "js-polo";
import { bytesToHex } from "@noble/secp256k1";
export const validateKeyAdd = (key, index) => {
    if (typeof key.public_key !== "string" || key.public_key.length === 0) {
        throw new Error("public key must be a non-empty hex string");
    }
    if (typeof key.weight !== "number" || key.weight <= 0) {
        throw new Error("weight must be a positive number");
    }
    if (key.signature_algorithm !== 0) {
        throw new Error("signature algorithm must be 0");
    }
};
/**
 * Validates the payload for ASSET_TRANSFER operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated logic action payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetTransferPayload = (payload) => {
    if ('beneficiary' in payload && 'asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    return key;
};
/**
 * Validates the payload for LOGIC_DEPLOY operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicDeployPayload} - The validated logic deploy payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicDeployPayload = (payload) => {
    if ('manifest' in payload && 'callsite' in payload) {
        return payload;
    }
};
/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicActionPayload} - The validated logic action payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicActionPayload = (payload) => {
    if ('logic_id' in payload && 'callsite' in payload) {
        return payload;
    }
    throw new Error("Invalid logic invoke or enlist payload");
};
/**
 * Processes the payload based on the operation type.
 *
 * @param {OpType} opType - The operation type.
 * @param {OperationPayload} payload - The operation payload.
 * @returns {OperationPayload} - The processed operation payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
const processPayload = (opType, payload) => {
    switch (opType) {
        case OpType.PARTICIPANT_CREATE: {
            const participantPayload = validateParticipantCreatePayload(payload);
            return {
                ...participantPayload,
                address: hexToBytes(participantPayload.address),
            };
        }
        for (const [k, v] of Object.entries(payload.interfaces)) {
            if (typeof k !== "string" || k.length === 0) {
                throw new Error("interface key must be a non-empty string");
            }
            if (typeof v !== "string" || v.length === 0) {
                throw new Error(`interface['${k}'] must be a non-empty hex string`);
            }
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
                calldata: logicPayload.calldata ? hexToBytes(logicPayload.calldata) : null,
            };
        }
        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST: {
            const logicPayload = validateLogicActionPayload(payload);
            return {
                logic_id: trimHexPrefix(logicPayload.logic_id),
                callsite: logicPayload.callsite,
                calldata: logicPayload.calldata ? hexToBytes(logicPayload.calldata) : null,
            };
        }
        default:
            ErrorUtils.throwError(`Unsupported operation type: ${opType}`, ErrorCode.UNSUPPORTED_OPERATION);
    }
};
/**
 * Serializes the payload of a operation based on its type.
 * This function polorizes (serializes) the payload using the appropriate schema
 * based on the operation type and returns it as a byte array.
 *
 * @param {OpType} opType - The type of the operation (e.g., ASSET_TRANSFER, ASSET_CREATE).
 * @param {OperationPayload} payload - The payload of the operation to be serialized.
 * @returns {Uint8Array} - A serialized byte array representing the processed payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
export const serializePayload = (opType, payload) => {
    const polorizer = new Polorizer();
    const processedPayload = processPayload(opType, payload);
    switch (opType) {
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
            ErrorUtils.throwError(`Unsupported operation type: ${opType}`, ErrorCode.UNSUPPORTED_OPERATION);
    }
};
/**
 * Processes the interaction object to extract and consolidate asset funds from
 * ix_operations and asset funds.
 *
 * @param {InteractionObject} ixObject - The interaction object containing ix_operations and asset funds.
 * @returns {ProcessedIxAssetFund[]} - The consolidated list of processed asset funds.
 */
const processFunds = (ixObject) => {
    const assetFunds = new Map();
    ixObject.ix_operations.forEach(operation => {
        switch (operation.type) {
            case OpType.ASSET_TRANSFER:
            case OpType.ASSET_BURN: {
                const payload = operation.payload;
                const amount = assetFunds.get(payload.asset_id) ?? 0;
                if (typeof payload.amount === "bigint" || typeof amount === "bigint") {
                    assetFunds.set(payload.asset_id, toQuantity(BigInt(payload.amount) + BigInt(amount)));
                    return;
                }
                assetFunds.set(payload.asset_id, toQuantity(Number(payload.amount) + Number(amount)));
            }
        }
    });
    if (ixObject.funds != null) {
        // Add additional asset funds to the list if not present
        ixObject.funds.forEach(assetFund => {
            if (!assetFunds.has(assetFund.asset_id)) {
                assetFunds.set(assetFund.asset_id, toQuantity(assetFund.amount));
            }
        });
    }
    return Array.from(assetFunds, ([asset_id, amount]) => ({ asset_id, amount }));
};
function processParticipantCreate(payload) {
    const processed = {
        id: new ParticipantId(payload.id).toBytes(),
        keys_payload: mapPublicKeys(payload.keys_payload),
        value: withCalldata(withAssetId(payload.value)),
    };
    return polorize(processed, participantCreateSchema);
}
function processAccountConfigure(payload) {
    return polorize({ ...payload, add: mapPublicKeys(payload.add) }, accountConfigureSchema);
}
function processAccountInherit(payload) {
    const processed = {
        ...payload,
        target_account: new Identifier(payload.target_account).toBytes(),
        value: withCalldata(withAssetId(payload.value)),
    };
    return polorize(processed, accountInheritSchema);
}
function processAssetCreate(payload) {
    const createPayload = {
        ...payload,
        manager: new ParticipantId(payload.manager).toBytes(),
        static_metadata: mapHexValues(payload.static_metadata),
        dynamic_metadata: mapHexValues(payload.dynamic_metadata),
    };
    if (payload.logic_payload) {
        createPayload.logic_payload = {
            ...withCalldata(payload.logic_payload),
            manifest: hexToBytes(payload.logic_payload.manifest),
            interfaces: mapHexValues(payload.logic_payload.interfaces),
        };
    }
    return polorize(createPayload, assetCreateSchema);
}
function processAssetInvoke(op) {
    validateAssetAction(op);
    const payload = withCalldata(withAssetId(op));
    return polorize(payload, assetActionSchema);
}
function processLogicDeploy(payload) {
    const processed = {
        ...withCalldata(payload),
        manifest: hexToBytes(payload.manifest),
        interfaces: mapHexValues(payload.interfaces),
    };
    return polorize(processed, logicSchema);
}
function processLogicAction(payload) {
    const processed = {
        ...withCalldata(payload),
        logic_id: LogicId.isValid(payload.logic_id) ? new LogicId(payload.logic_id).toBytes() :
            new AssetId(payload.logic_id).toBytes(),
        interfaces: mapHexValues(payload.interfaces),
    };
    return polorize(processed, logicSchema);
}
/**
 * Processes ix_operations and returns an array of processed participants.
 *
 * @param {InteractionObject} ixObject - The interaction object containing sender, payer, operations, etc.
 * @returns {IxParticipant[]} - The processed participants.
 * @throws {Error} - If an unsupported operation type is encountered.
 */
const processParticipants = (ixObject) => {
    const participants = new Map();
    const addParticipant = (id, lock_type) => {
        participants.set(trimHexPrefix(id), { id, lock_type });
    };
    // Add sender
    addParticipant(ixObject.sender.id, LockType.MUTATE_LOCK);
    // Add payer if present
    if (ixObject.payer && ixObject.payer != ZERO_ADDRESS) {
        addParticipant(ixObject.payer, LockType.MUTATE_LOCK);
    }
    // Process operations
    for (const operation of ixObject.ix_operations) {
        switch (operation.type) {
            case OpType.PARTICIPANT_CREATE: {
                const { value } = operation.payload;
                addParticipant(value.asset_id, LockType.NO_LOCK);
                break;
            }
            case OpType.ACCOUNT_CONFIGURE:
                break;
            case OpType.ACCOUNT_INHERIT:
                addParticipant(KMOI_ASSET_ID, LockType.NO_LOCK);
                break;
            case OpType.ASSET_CREATE:
                break;
            case OpType.ASSET_INVOKE: {
                const { asset_id } = operation.payload;
                addParticipant(withHexPrefix(asset_id), LockType.MUTATE_LOCK);
                break;
            }
            case OpType.LOGIC_DEPLOY:
                break;
            case OpType.LOGIC_ENLIST:
            case OpType.LOGIC_INVOKE:
                const { logic_id } = operation.payload;
                addParticipant(withHexPrefix(logic_id), LockType.MUTATE_LOCK);
                break;
            default:
                ErrorUtils.throwError("Unsupported Ix type", ErrorCode.INVALID_ARGUMENT);
        }
    }
    // Merge additional participants (if not already present)
    if (ixObject.participants) {
        for (const { id, lock_type } of ixObject.participants) {
            addParticipant(id, lock_type);
        }
    }
    return [...participants.values()];
};
export const processInteractionObject = (ix) => {
    return {
        ...ix,
        participants: processParticipants(ix),
    };
};
const toRawFund = (fund) => {
    return {
        ...fund,
        asset_id: new AssetId(fund.asset_id).toBytes(),
    };
};
const toRawParticipant = (participant) => {
    return {
        ...participant,
        id: new Identifier(participant.id).toBytes(),
    };
};
const toRawOperation = (operation) => {
    switch (operation.type) {
        case OpType.PARTICIPANT_CREATE: {
            validateParticipantCreate(operation.payload);
            return {
                ...operation,
                payload: processParticipantCreate(operation.payload)
            };
        }
        case OpType.ACCOUNT_CONFIGURE: {
            validateAccountConfigure(operation.payload);
            return {
                ...operation,
                payload: processAccountConfigure(operation.payload)
            };
        }
        case OpType.ACCOUNT_INHERIT: {
            validateAccountInherit(operation.payload);
            return {
                ...operation,
                payload: processAccountInherit(operation.payload)
            };
        }
        case OpType.ASSET_CREATE: {
            validateAssetCreate(operation.payload);
            return {
                ...operation,
                payload: processAssetCreate(operation.payload)
            };
        }
        case OpType.ASSET_INVOKE: {
            validateAssetAction(operation.payload);
            return {
                ...operation,
                payload: processAssetInvoke(operation.payload)
            };
        }
        case OpType.LOGIC_DEPLOY: {
            validateLogicDeploy(operation.payload);
            return {
                ...operation,
                payload: processLogicDeploy(operation.payload)
            };
        }
        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST: {
            validateLogicAction(operation.payload);
            return {
                ...operation,
                payload: processLogicAction(operation.payload)
            };
        }
        default:
            throw new Error(`Unsupported interaction type: ${operation.type}`);
    }
};
/**
 * Transforms an interaction object to a format that can be serialized to POLO.
 *
 * @param ix Interaction object
 * @returns a raw interaction object
 */
export const toRawInteractionObject = (ix) => {
    ix.participants = processParticipants(ix);
    return {
        ...ix,
        sender: { ...ix.sender, id: new ParticipantId(ix.sender.id).toBytes() },
        payer: ix.payer ? new ParticipantId(ix.payer).toBytes() : hexToBytes(ZERO_ADDRESS),
        funds: ix.funds?.map((fund) => toRawFund(fund)),
        participants: ix.participants?.map((participant) => toRawParticipant(participant)),
        ix_operations: ix.ix_operations?.map((operation) => toRawOperation(operation)),
        preferences: ix.preferences ? {
            ...ix.preferences,
            compute: hexToBytes(ix.preferences.compute),
        } : undefined,
        perception: ix.perception ? hexToBytes(ix.perception) : undefined,
    };
};
export const toRawSignatures = (signs) => {
    return signs.map(sign => ({
        ...sign,
        id: hexToBytes(sign.id),
        signature: hexToBytes(sign.signature)
    }));
};
const toFundArgs = (fund) => {
    return {
        ...fund,
        amount: toQuantity(fund.amount)
    };
};
const toOperationArgs = (operation) => {
    const rawOpPayload = toRawOperation(operation);
    return {
        ...operation,
        payload: "0x" + bytesToHex(rawOpPayload.payload)
    };
};
export const toInteractionArgs = (ix) => {
    ix.participants = processParticipants(ix);
    return {
        sender: ix.sender,
        payer: ix.payer ?? ZERO_ADDRESS,
        fuel_price: toQuantity(ix.fuel_price),
        fuel_limit: toQuantity(ix.fuel_limit),
        funds: ix.funds?.map((fund) => toFundArgs(fund)),
        ix_operations: ix.ix_operations?.map((operation) => toOperationArgs(operation)),
        preferences: ix.preferences ? {
            ...ix.preferences,
            consensus: {
                ...ix.preferences.consensus,
                mtq: toQuantity(ix.preferences.consensus.mtq ?? 0)
            },
        } : undefined,
        participants: ix.participants
    };
};
//# sourceMappingURL=interaction.js.map