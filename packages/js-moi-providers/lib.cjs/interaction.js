"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toInteractionArgs = exports.toRawSignatures = exports.toRawInteractionObject = exports.processInteractionObject = exports.validateAssetCreate = exports.validateLogicAction = exports.validateLogicDeploy = exports.validateLogicPayload = exports.validateAccountInherit = exports.validateAccountConfigure = exports.validateParticipantCreate = exports.validateAssetAction = exports.validateKeyRevoke = exports.validateKeyAdd = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_moi_constants_1 = require("js-moi-constants");
const js_polo_1 = require("js-polo");
const secp256k1_1 = require("@noble/secp256k1");
const validateKeyAdd = (key, index) => {
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
exports.validateKeyAdd = validateKeyAdd;
const validateKeyRevoke = (key, index) => {
    if (typeof key.key_id !== "number" || key.key_id < 0) {
        throw new Error("key id must be a non-negative number");
    }
    return key;
};
exports.validateKeyRevoke = validateKeyRevoke;
const validateAssetAction = (value) => {
    if (value == null)
        throw new Error("payload is required");
    const { asset_id, callsite, calldata, funds } = value;
    if (typeof asset_id !== "string" || asset_id.length === 0) {
        throw new Error("asset_id must be a non-empty hex string");
    }
    if (typeof callsite !== "string" || callsite.length === 0) {
        throw new Error("callsite must be a non-empty string");
    }
    if (calldata !== undefined) {
        if (typeof calldata !== "string" || calldata.length === 0) {
            throw new Error("calldata must be a non-empty hex string if provided");
        }
    }
    if (funds != null) {
        if (!(funds instanceof Object)) {
            throw new Error("funds must be a Object<Hex, number|bigint>");
        }
        for (const [k, v] of Object.entries(funds)) {
            if (typeof k !== "string" || k.length === 0) {
                throw new Error("funds keys must be non-empty hex strings");
            }
            if (typeof v !== "number" && typeof v !== "bigint") {
                throw new Error("funds values must be number or bigint");
            }
            if (typeof v === "number" && v < 0) {
                throw new Error("funds number values must be non-negative");
            }
        }
    }
};
exports.validateAssetAction = validateAssetAction;
const validateParticipantCreate = (payload) => {
    if (!payload) {
        throw new Error("payload is required");
    }
    if (typeof payload.id !== "string" || payload.id.length === 0) {
        throw new Error("id must be a non-empty string (Hex address)");
    }
    if (!Array.isArray(payload.keys_payload)) {
        throw new Error(`keys payload must be an array`);
    }
    if (payload.keys_payload == null || payload.keys_payload.length === 0) {
        throw new Error(`keys payload must not be empty`);
    }
    (0, exports.validateAssetAction)(payload.value);
    payload.keys_payload.forEach((k, idx) => (0, exports.validateKeyAdd)(k, idx));
};
exports.validateParticipantCreate = validateParticipantCreate;
const validateAccountConfigure = (payload) => {
    if (!payload) {
        throw new Error("payload is required");
    }
    const hasAdd = Array.isArray(payload.add) && payload.add.length > 0;
    const hasRevoke = Array.isArray(payload.revoke) && payload.revoke.length > 0;
    if (!hasAdd && !hasRevoke) {
        throw new Error("payload must have either non-empty add or revoke");
    }
    if (hasAdd) {
        payload.add.forEach((k, idx) => (0, exports.validateKeyAdd)(k, idx));
    }
    if (hasRevoke) {
        payload.revoke.forEach((k, idx) => (0, exports.validateKeyRevoke)(k, idx));
    }
};
exports.validateAccountConfigure = validateAccountConfigure;
const validateAccountInherit = (payload) => {
    if (!payload) {
        throw new Error("payload is required");
    }
    if (typeof payload.target_account !== "string" || payload.target_account.length === 0) {
        throw new Error("target account must be a non-empty hex string");
    }
    (0, exports.validateAssetAction)(payload.value);
    // sub_account_index must be a non-negative number
    if (typeof payload.sub_account_index !== "number" || payload.sub_account_index < 0) {
        throw new Error("sub account index must be a non-negative number");
    }
};
exports.validateAccountInherit = validateAccountInherit;
const validateLogicPayload = (payload) => {
    if (typeof payload.callsite !== "string" || payload.callsite.length === 0) {
        throw new Error("callsite must be a non-empty string");
    }
    if (payload.calldata !== undefined) {
        if (typeof payload.calldata !== "string" || payload.calldata.length === 0) {
            throw new Error("calldata must be a non-empty hex string if provided");
        }
    }
    if (payload.interfaces !== undefined) {
        if (typeof payload.interfaces !== "object" || Array.isArray(payload.interfaces)) {
            throw new Error("interfaces must be an object");
        }
        for (const [k, v] of Object.entries(payload.interfaces)) {
            if (typeof k !== "string" || k.length === 0) {
                throw new Error("interface key must be a non-empty string");
            }
            if (typeof v !== "string" || v.length === 0) {
                throw new Error(`interface['${k}'] must be a non-empty hex string`);
            }
        }
    }
};
exports.validateLogicPayload = validateLogicPayload;
const validateLogicDeploy = (payload) => {
    if (!payload) {
        throw new Error("payload is required");
    }
    if (typeof payload.manifest == null) {
        throw new Error("payload must include manifest");
    }
    (0, exports.validateLogicPayload)(payload);
};
exports.validateLogicDeploy = validateLogicDeploy;
const validateLogicAction = (payload) => {
    if (!payload) {
        throw new Error("payload is required");
    }
    // manifest is omitted, so we don’t validate it
    if (typeof payload.logic_id !== "string" || payload.logic_id.length === 0) {
        throw new Error("logic_id must be a non-empty hex string");
    }
    (0, exports.validateLogicPayload)(payload);
};
exports.validateLogicAction = validateLogicAction;
const validateAssetCreate = (payload) => {
    if (!payload) {
        throw new Error("payload is required");
    }
    // symbol: required, non-empty string
    if (typeof payload.symbol !== "string" || payload.symbol.length === 0) {
        throw new Error("symbol must be a non-empty string");
    }
    // dimension: optional, must be non-negative number if provided
    if (payload.dimension !== undefined) {
        if (typeof payload.dimension !== "number" || payload.dimension < 0) {
            throw new Error("dimension must be a non-negative number if provided");
        }
    }
    // decimals: optional, must be non-negative number if provided
    if (payload.decimals !== undefined) {
        if (typeof payload.decimals !== "number" || payload.decimals < 0) {
            throw new Error("decimals must be a non-negative number if provided");
        }
    }
    // standard: required
    if (payload.standard == null) {
        throw new Error("standard is required");
    }
    // enable_events: required boolean
    if (typeof payload.enable_events !== "boolean") {
        throw new Error("enable events must be a boolean value");
    }
    // manager: required non-empty hex string
    if (typeof payload.manager !== "string" || payload.manager.length === 0) {
        throw new Error("manager must be a non-empty hex string");
    }
    // max_supply: required non-negative number
    if (typeof payload.max_supply !== "number" || payload.max_supply < 0) {
        throw new Error("max_supply must be a non-negative number");
    }
    // metadata: required object with arrays of non-empty hex strings
    if (payload.metadata) {
        if (typeof payload.metadata !== "object" || Array.isArray(payload.metadata)) {
            throw new Error("metadata must be a non-empty object");
        }
        for (const [k, v] of Object.entries(payload.metadata)) {
            if (typeof v !== "string" || v.length === 0) {
                throw new Error(`metadata['${k}'] must be a non-empty hex string`);
            }
        }
    }
    // logic_payload: optional, validated if provided
    if (payload.logic_payload !== undefined) {
        (0, exports.validateLogicAction)(payload.logic_payload);
    }
    return payload;
};
exports.validateAssetCreate = validateAssetCreate;
const polorize = (payload, schema) => {
    const polorizer = new js_polo_1.Polorizer();
    polorizer.polorize(payload, schema);
    return polorizer.bytes();
};
const withCalldata = (payload) => ({
    ...payload,
    calldata: payload.calldata ? (0, js_moi_utils_1.hexToBytes)(payload.calldata) : new Uint8Array(),
});
const withAssetId = (payload) => ({
    ...payload,
    asset_id: new js_moi_identifiers_1.Identifier(payload.asset_id).toBytes(),
});
const mapPublicKeys = (keys) => keys?.map(k => ({ ...k, public_key: (0, js_moi_utils_1.hexToBytes)(k.public_key) }));
const mapHexValues = (obj = {}) => {
    const out = new Map();
    Object.keys(obj).forEach(k => { out[k] = (0, js_moi_utils_1.hexToBytes)(out[k]); });
    return out;
};
function processParticipantCreate(payload) {
    const processed = {
        id: new js_moi_identifiers_1.ParticipantId(payload.id).toBytes(),
        keys_payload: mapPublicKeys(payload.keys_payload),
        value: withCalldata(withAssetId(payload.value)),
    };
    return polorize(processed, js_moi_utils_1.participantCreateSchema);
}
function processAccountConfigure(payload) {
    return polorize({ ...payload, add: mapPublicKeys(payload.add) }, js_moi_utils_1.accountConfigureSchema);
}
function processAccountInherit(payload) {
    const processed = {
        ...payload,
        target_account: new js_moi_identifiers_1.Identifier(payload.target_account).toBytes(),
        value: withCalldata(withAssetId(payload.value)),
    };
    return polorize(processed, js_moi_utils_1.accountInheritSchema);
}
function processAssetCreate(payload) {
    const createPayload = {
        ...payload,
        manager: new js_moi_identifiers_1.ParticipantId(payload.manager).toBytes(),
        metadata: mapHexValues(payload.metadata),
    };
    if (payload.logic_payload) {
        createPayload.logic_payload = {
            ...withCalldata(payload.logic_payload),
            logic_id: new js_moi_identifiers_1.AssetId(payload.logic_payload.logic_id).toBytes(),
            interfaces: mapHexValues(payload.logic_payload.interfaces),
        };
    }
    return polorize(createPayload, js_moi_utils_1.assetCreateSchema);
}
function processAssetInvoke(op) {
    (0, exports.validateAssetAction)(op);
    const payload = withCalldata(withAssetId(op));
    return polorize(payload, js_moi_utils_1.assetActionSchema);
}
function processLogicDeploy(payload) {
    const processed = {
        ...withCalldata(payload),
        manifest: (0, js_moi_utils_1.hexToBytes)(payload.manifest),
        interfaces: mapHexValues(payload.interfaces),
    };
    return polorize(processed, js_moi_utils_1.logicSchema);
}
function processLogicAction(payload) {
    const processed = {
        ...withCalldata(payload),
        logic_id: new js_moi_identifiers_1.AssetId(payload.logic_id).toBytes(),
        interfaces: mapHexValues(payload.interfaces),
    };
    return polorize(processed, js_moi_utils_1.logicSchema);
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
        participants.set((0, js_moi_utils_1.trimHexPrefix)(id), { id, lock_type });
    };
    // Add sender
    addParticipant(ixObject.sender.id, js_moi_utils_1.LockType.MUTATE_LOCK);
    // Add payer if present
    if (ixObject.payer && ixObject.payer != js_moi_constants_1.ZERO_ADDRESS) {
        addParticipant(ixObject.payer, js_moi_utils_1.LockType.MUTATE_LOCK);
    }
    // Process operations
    for (const operation of ixObject.ix_operations) {
        switch (operation.type) {
            case js_moi_utils_1.OpType.PARTICIPANT_CREATE: {
                const { value } = operation.payload;
                addParticipant(value.asset_id, js_moi_utils_1.LockType.NO_LOCK);
                break;
            }
            case js_moi_utils_1.OpType.ACCOUNT_CONFIGURE:
                break;
            case js_moi_utils_1.OpType.ACCOUNT_INHERIT:
                addParticipant(js_moi_constants_1.KMOI_ASSET_ID, js_moi_utils_1.LockType.NO_LOCK);
                break;
            case js_moi_utils_1.OpType.ASSET_CREATE:
                break;
            case js_moi_utils_1.OpType.ASSET_INVOKE: {
                const { asset_id } = operation.payload;
                addParticipant(asset_id, js_moi_utils_1.LockType.NO_LOCK);
                break;
            }
            case js_moi_utils_1.OpType.LOGIC_DEPLOY:
            case js_moi_utils_1.OpType.LOGIC_ENLIST:
            case js_moi_utils_1.OpType.LOGIC_INVOKE:
                break;
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported Ix type", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
    }
    // Merge additional participants (if not already present)
    if (ixObject.participants) {
        for (const { id, lock_type } of ixObject.participants) {
            if (!participants.has((0, js_moi_utils_1.trimHexPrefix)(id))) {
                addParticipant(id, lock_type);
            }
        }
    }
    return [...participants.values()];
};
const processInteractionObject = (ix) => {
    return {
        ...ix,
        participants: processParticipants(ix),
    };
};
exports.processInteractionObject = processInteractionObject;
const toRawFund = (fund) => {
    return {
        ...fund,
        asset_id: new js_moi_identifiers_1.AssetId(fund.asset_id).toBytes(),
    };
};
const toRawParticipant = (participant) => {
    return {
        ...participant,
        id: new js_moi_identifiers_1.Identifier(participant.id).toBytes(),
    };
};
const toRawOperation = (operation) => {
    switch (operation.type) {
        case js_moi_utils_1.OpType.PARTICIPANT_CREATE: {
            (0, exports.validateParticipantCreate)(operation.payload);
            return {
                ...operation,
                payload: processParticipantCreate(operation.payload)
            };
        }
        case js_moi_utils_1.OpType.ACCOUNT_CONFIGURE: {
            (0, exports.validateAccountConfigure)(operation.payload);
            return {
                ...operation,
                payload: processAccountConfigure(operation.payload)
            };
        }
        case js_moi_utils_1.OpType.ACCOUNT_INHERIT: {
            (0, exports.validateAccountInherit)(operation.payload);
            return {
                ...operation,
                payload: processAccountInherit(operation.payload)
            };
        }
        case js_moi_utils_1.OpType.ASSET_CREATE: {
            (0, exports.validateAssetCreate)(operation.payload);
            return {
                ...operation,
                payload: processAssetCreate(operation.payload)
            };
        }
        case js_moi_utils_1.OpType.ASSET_INVOKE: {
            (0, exports.validateAssetAction)(operation.payload);
            return {
                ...operation,
                payload: processAssetInvoke(operation.payload)
            };
        }
        case js_moi_utils_1.OpType.LOGIC_DEPLOY: {
            (0, exports.validateLogicDeploy)(operation.payload);
            return {
                ...operation,
                payload: processLogicDeploy(operation.payload)
            };
        }
        case js_moi_utils_1.OpType.LOGIC_INVOKE:
        case js_moi_utils_1.OpType.LOGIC_ENLIST: {
            (0, exports.validateLogicAction)(operation.payload);
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
const toRawInteractionObject = (ix) => {
    ix.participants = processParticipants(ix);
    return {
        ...ix,
        sender: { ...ix.sender, id: new js_moi_identifiers_1.ParticipantId(ix.sender.id).toBytes() },
        payer: ix.payer ? new js_moi_identifiers_1.ParticipantId(ix.payer).toBytes() : (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS),
        funds: ix.funds?.map((fund) => toRawFund(fund)),
        participants: ix.participants?.map((participant) => toRawParticipant(participant)),
        ix_operations: ix.ix_operations?.map((operation) => toRawOperation(operation)),
        preferences: ix.preferences ? {
            ...ix.preferences,
            compute: ix.preferences.compute ? (0, js_moi_utils_1.hexToBytes)(ix.preferences.compute) : undefined,
        } : undefined,
        perception: ix.perception ? (0, js_moi_utils_1.hexToBytes)(ix.perception) : undefined,
    };
};
exports.toRawInteractionObject = toRawInteractionObject;
const toRawSignatures = (signs) => {
    return signs.map(sign => ({
        ...sign,
        id: (0, js_moi_utils_1.hexToBytes)(sign.id),
        signature: (0, js_moi_utils_1.hexToBytes)(sign.signature)
    }));
};
exports.toRawSignatures = toRawSignatures;
const toFundArgs = (fund) => {
    return {
        ...fund,
        amount: (0, js_moi_utils_1.toQuantity)(fund.amount)
    };
};
const toOperationArgs = (operation) => {
    const rawOpPayload = toRawOperation(operation);
    return {
        ...operation,
        payload: (0, secp256k1_1.bytesToHex)(rawOpPayload.payload)
    };
};
const toInteractionArgs = (ix) => {
    ix.participants = processParticipants(ix);
    return {
        sender: ix.sender,
        payer: ix.payer ?? js_moi_constants_1.ZERO_ADDRESS,
        fuel_price: (0, js_moi_utils_1.toQuantity)(ix.fuel_price),
        fuel_limit: (0, js_moi_utils_1.toQuantity)(ix.fuel_limit),
        funds: ix.funds?.map((fund) => toFundArgs(fund)),
        ix_operations: ix.ix_operations?.map((operation) => toOperationArgs(operation)),
        preferences: ix.preferences ? {
            ...ix.preferences,
            consensus: ix.preferences.consensus ? {
                ...ix.preferences.consensus,
                mtq: (0, js_moi_utils_1.toQuantity)(ix.preferences.consensus.mtq ?? 0)
            } : undefined,
        } : undefined,
    };
};
exports.toInteractionArgs = toInteractionArgs;
//# sourceMappingURL=interaction.js.map