import { accessDeletePayloadSchema, accessPayloadSchema, accountConfigureSchema, accountInheritSchema, assetActionSchema, assetCreateSchema, CallerKind, ErrorCode, ErrorUtils, Hex, hexToBytes, LockType, logicSchema, OpType, participantCreateSchema, ResourceType, storagePayloadSchema, toQuantity, trimHexPrefix, withHexPrefix } from "js-moi-utils";
import { InteractionObject, IxFund, IxParticipant, RawInteractionObject, RawIxFund, RawIxParticipant, Signature, RawSignature, InteractionArgs, IxFundArgs, IxOperationArgs } from "../types/interaction";
import { ParticipantId, AssetId, Identifier, LogicId } from "js-moi-identifiers";
import { AccessDeletePayload, AccessPayload, AccessPolicy, AccountConfigurePayload, AccountInheritPayload, AssetActionPayload, AssetCreatePayload, CallerConstraint, KeyAddPayload, KeyRevokePayload, LogicActionPayload, LogicDeployPayload, ParticipantCreatePayload, RawAccessDeletePayload, RawAccessPayload, RawAccessPolicy, RawAssetCreatePayload, RawCallerConstraint, RawIxOperation, RawStoragePayload, StoragePayload } from "../types/operation";
import {ZERO_ADDRESS, KMOI_ASSET_ID} from "js-moi-constants";
import { Polorizer } from "js-polo";
import { bytesToHex } from "@noble/secp256k1";

export const validateKeyAdd = (key: KeyAddPayload, index: number) => {
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

export const validateKeyRevoke = (key: KeyRevokePayload, index: number) => {
  if (typeof key.key_id !== "number" || key.key_id < 0) {
    throw new Error("key id must be a non-negative number");
  }

  return key;
};

export const validateAssetAction = (value: AssetActionPayload) => {
  if (value == null) throw new Error("payload is required");

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

export const validateParticipantCreate = (payload: ParticipantCreatePayload) => {
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

  validateAssetAction(payload.value);

  payload.keys_payload.forEach((k, idx) => validateKeyAdd(k, idx))
};

export const validateAccountConfigure = (payload: AccountConfigurePayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  const hasAdd = Array.isArray(payload.add) && payload.add.length > 0;
  const hasRevoke = Array.isArray(payload.revoke) && payload.revoke.length > 0;

  if (!hasAdd && !hasRevoke) {
    throw new Error("payload must have either non-empty add or revoke");
  }

  if (hasAdd) {
    payload.add!.forEach((k, idx) => validateKeyAdd(k, idx));
  }

  if (hasRevoke) {
    payload.revoke!.forEach((k, idx) => validateKeyRevoke(k, idx));
  }
};

export const validateAccountInherit = (payload: AccountInheritPayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  if (typeof payload.target_account !== "string" || payload.target_account.length === 0) {
    throw new Error("target account must be a non-empty hex string");
  }

  validateAssetAction(payload.value);

  // sub_account_index must be a non-negative number
  if (typeof payload.sub_account_index !== "number" || payload.sub_account_index < 0) {
    throw new Error("sub account index must be a non-negative number");
  }
};

export const validateStorageDeposit = (payload: StoragePayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  if (typeof payload.target_account !== "string" || payload.target_account.length === 0) {
    throw new Error("target_account must be a non-empty hex string");
  }

  // Note: defaulting deposit_for to the signer's own identifier happens in the
  // StorageDeposit builder (js-moi-interactions), which has signer context that
  // this lower-level encoding step does not. By the time a payload reaches here,
  // deposit_for must already be resolved.
  if (typeof payload.deposit_for !== "string" || payload.deposit_for.length === 0) {
    throw new Error("deposit_for must be a non-empty hex string");
  }

  if (payload.amount == null || (typeof payload.amount !== "number" && typeof payload.amount !== "bigint")) {
    throw new Error("amount must be a number or bigint");
  }

  if (payload.amount <= 0) {
    throw new Error("amount must be greater than zero");
  }
};

export const validateStorageWithdraw = (payload: StoragePayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  if (typeof payload.target_account !== "string" || payload.target_account.length === 0) {
    throw new Error("target_account must be a non-empty hex string");
  }

  if (payload.bytes_to_release !== undefined && (typeof payload.bytes_to_release !== "number" || payload.bytes_to_release < 0)) {
    throw new Error("bytes_to_release must be a non-negative number if provided (0 or omitted releases everything available)");
  }
};

export const validateCallerConstraint = (constraint: CallerConstraint, label: string) => {
  if (!constraint) {
    throw new Error(`${label} is required`);
  }

  if (constraint.kind !== CallerKind.ANY && constraint.kind !== CallerKind.SET) {
    throw new Error(`${label}.kind must be a valid CallerKind`);
  }

  if (constraint.kind === CallerKind.SET && (!Array.isArray(constraint.set) || constraint.set.length === 0)) {
    throw new Error(`${label}.set must be a non-empty array when kind is CallerKind.SET`);
  }
};

export const validateAccessPolicy = (policy: AccessPolicy) => {
  if (!policy) {
    throw new Error("access_policy is required");
  }

  if (policy.resource !== ResourceType.STORAGE) {
    throw new Error("only ResourceType.STORAGE is currently supported");
  }

  if (typeof policy.resource_id !== "string" || policy.resource_id.length === 0) {
    throw new Error("resource_id must be a non-empty hex string");
  }

  if (!policy.actions || policy.actions <= 0) {
    throw new Error("actions must be a non-zero bitmask");
  }

  validateCallerConstraint(policy.caller, "caller");
  validateCallerConstraint(policy.origin, "origin");
};

export const validateAccessCreateOrUpdate = (payload: AccessPayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  if (typeof payload.target_account !== "string" || payload.target_account.length === 0) {
    throw new Error("target_account must be a non-empty hex string");
  }

  validateAccessPolicy(payload.access_policy);
};

export const validateAccessDelete = (payload: AccessDeletePayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  if (typeof payload.target_account !== "string" || payload.target_account.length === 0) {
    throw new Error("target_account must be a non-empty hex string");
  }

  if (payload.resource == null) {
    throw new Error("resource is required");
  }

  if (typeof payload.resource_id !== "string" || payload.resource_id.length === 0) {
    throw new Error("resource_id must be a non-empty hex string");
  }
};

export const validateLogicPayload = (payload: LogicDeployPayload | LogicActionPayload) => {
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
}

export const validateLogicDeploy = (payload: LogicDeployPayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  if (typeof payload.manifest == null) {
    throw new Error("payload must include manifest");
  }

  validateLogicPayload(payload)
};

export const validateLogicAction = (payload: LogicActionPayload) => {
  if (!payload) {
    throw new Error("payload is required");
  }

  // manifest is omitted, so we don’t validate it

  if (typeof payload.logic_id !== "string" || payload.logic_id.length === 0) {
    throw new Error("logic_id must be a non-empty hex string");
  }

  validateLogicPayload(payload)
};

export const validateAssetCreate = (payload: AssetCreatePayload) => {
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

  // static metadata: required object with arrays of non-empty hex strings
  if (payload.static_metadata) {
    if(typeof payload.static_metadata !== "object" || Array.isArray(payload.static_metadata)) {
        throw new Error("static metadata must be a non-empty object");
    }

    for (const [k, v] of Object.entries(payload.static_metadata)) {
      if (typeof v !== "string" || v.length === 0) {
          throw new Error(`static metadata['${k}'] must be a non-empty hex string`);
      }
    }
  }

  // dynamic metadata: required object with arrays of non-empty hex strings
  if (payload.dynamic_metadata) {
    if(typeof payload.dynamic_metadata !== "object" || Array.isArray(payload.dynamic_metadata)) {
        throw new Error("dynamic metadata must be a non-empty object");
    }

    for (const [k, v] of Object.entries(payload.dynamic_metadata)) {
      if (typeof v !== "string" || v.length === 0) {
          throw new Error(`dynamic metadata['${k}'] must be a non-empty hex string`);
      }
    }
  }

  // logic_payload: optional, validated if provided
  if (payload.logic_payload !== undefined) {
    validateLogicDeploy(payload.logic_payload);
  }

  return payload;
};

const polorize = (payload: any, schema: any) => {
    const polorizer = new Polorizer()
    polorizer.polorize(payload, schema)
    return polorizer.bytes()
}

const withCalldata = (payload: any) => ({
    ...payload,
    calldata: payload.calldata ? hexToBytes(payload.calldata) : new Uint8Array(),
})

const withAssetId = (payload: any) => ({
    ...payload,
    asset_id: new Identifier(payload.asset_id).toBytes(),
})

const mapPublicKeys = (keys: any[] | undefined) =>
    keys?.map(k => ({ ...k, public_key: hexToBytes(k.public_key) }))

const mapHexValues = (obj: Record<string, string> = {}) => {
    const out = new Map<string, Uint8Array>()
    Object.keys(obj).forEach(k => out.set(k, hexToBytes(obj[k])))

    return out
}

function processParticipantCreate(payload: ParticipantCreatePayload) {
    const processed = {
        id: new ParticipantId(payload.id).toBytes(),
        keys_payload: mapPublicKeys(payload.keys_payload),
        value: withCalldata(withAssetId(payload.value)),
    }

    return polorize(processed, participantCreateSchema)
}

function processAccountConfigure(payload: AccountConfigurePayload) {
    return polorize({ ...payload, add: mapPublicKeys(payload.add) }, accountConfigureSchema)
}

function processAccountInherit(payload: AccountInheritPayload) {
    const processed = {
        ...payload,
        target_account: new Identifier(payload.target_account).toBytes(),
        value: withCalldata(withAssetId(payload.value)),
    }

    return polorize(processed, accountInheritSchema)
}

function processStorageDeposit(payload: StoragePayload) {
    const processed: RawStoragePayload = {
        target_account: new Identifier(payload.target_account).toBytes(),
        deposit_for: new ParticipantId(payload.deposit_for!).toBytes(),
        amount: payload.amount!,
        bytes_to_release: 0,
    }

    return polorize(processed, storagePayloadSchema)
}

function processStorageWithdraw(payload: StoragePayload) {
    const processed: RawStoragePayload = {
        target_account: new Identifier(payload.target_account).toBytes(),
        deposit_for: new Uint8Array(32),
        amount: 0,
        bytes_to_release: payload.bytes_to_release ?? 0,
    }

    return polorize(processed, storagePayloadSchema)
}

const toRawCallerConstraint = (constraint: CallerConstraint): RawCallerConstraint => ({
    kind: constraint.kind,
    set: constraint.set.map(id => new Identifier(id).toBytes()),
})

const toRawAccessPolicy = (policy: AccessPolicy): RawAccessPolicy => ({
    resource: policy.resource,
    resource_id: new Identifier(policy.resource_id).toBytes(),
    actions: policy.actions,
    scope: { prefixes: (policy.scope?.prefixes ?? []).map(hexToBytes), predicate: null },
    caller: toRawCallerConstraint(policy.caller),
    origin: toRawCallerConstraint(policy.origin),
})

function processAccessCreateOrUpdate(payload: AccessPayload) {
    const processed: RawAccessPayload = {
        target_account: new Identifier(payload.target_account).toBytes(),
        access_policy: toRawAccessPolicy(payload.access_policy),
    }

    return polorize(processed, accessPayloadSchema)
}

function processAccessDelete(payload: AccessDeletePayload) {
    const processed: RawAccessDeletePayload = {
        target_account: new Identifier(payload.target_account).toBytes(),
        resource: payload.resource,
        resource_id: new Identifier(payload.resource_id).toBytes(),
    }

    return polorize(processed, accessDeletePayloadSchema)
}

function processAssetCreate(payload: AssetCreatePayload) {
    const createPayload: RawAssetCreatePayload = {
        ...payload,
        manager: new ParticipantId(payload.manager).toBytes(),
        static_metadata: mapHexValues(payload.static_metadata),
        dynamic_metadata: mapHexValues(payload.dynamic_metadata),
    }

    if (payload.logic_payload) {
        createPayload.logic_payload = {
            ...withCalldata(payload.logic_payload),
            manifest: hexToBytes(payload.logic_payload.manifest),
            interfaces: mapHexValues(payload.logic_payload.interfaces),
        }
    }

    return polorize(createPayload, assetCreateSchema)
}

function processAssetInvoke(op: any) {
    validateAssetAction(op)

    const payload = withCalldata(withAssetId(op))

    return polorize(payload, assetActionSchema)
}

function processLogicDeploy(payload: LogicDeployPayload) {
    const processed = {
        ...withCalldata(payload),
        manifest: hexToBytes(payload.manifest),
        interfaces: mapHexValues(payload.interfaces),
    }

    return polorize(processed, logicSchema)
}

function processLogicAction(payload: LogicActionPayload) {
    const processed = {
        ...withCalldata(payload),
        logic_id: LogicId.isValid(payload.logic_id!) ? new LogicId(payload.logic_id!).toBytes() :
        new AssetId(payload.logic_id!).toBytes(),
        interfaces: mapHexValues(payload.interfaces),
    }

    return polorize(processed, logicSchema)
}

/**
 * Processes ix_operations and returns an array of processed participants.
 *
 * @param {InteractionObject} ixObject - The interaction object containing sender, payer, operations, etc.
 * @returns {IxParticipant[]} - The processed participants.
 * @throws {Error} - If an unsupported operation type is encountered.
 */
const processParticipants = (ixObject: InteractionObject): IxParticipant[] => {
  const participants = new Map<string, IxParticipant>();

  const addParticipant = (id: Hex, lock_type: LockType) => {
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
        const { value } = operation.payload as ParticipantCreatePayload;
        addParticipant(value.asset_id, LockType.NO_LOCK)
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
        const { asset_id } = operation.payload as AssetActionPayload;
        addParticipant(withHexPrefix(asset_id), LockType.MUTATE_LOCK);
        break;
      }

      case OpType.LOGIC_DEPLOY:
        break;
      case OpType.LOGIC_ENLIST:
      case OpType.LOGIC_INVOKE:
        const { logic_id } = operation.payload as LogicActionPayload;
        addParticipant(withHexPrefix(logic_id!), LockType.MUTATE_LOCK);
        break;

      case OpType.STORAGE_DEPOSIT:
      case OpType.STORAGE_WITHDRAW: {
        const { target_account } = operation.payload as StoragePayload;
        addParticipant(withHexPrefix(target_account), LockType.MUTATE_LOCK);
        break;
      }

      case OpType.ACCESS_CREATE:
      case OpType.ACCESS_UPDATE: {
        const { target_account } = operation.payload as AccessPayload;
        addParticipant(withHexPrefix(target_account), LockType.MUTATE_LOCK);
        break;
      }

      case OpType.ACCESS_DELETE: {
        const { target_account } = operation.payload as AccessDeletePayload;
        addParticipant(withHexPrefix(target_account), LockType.MUTATE_LOCK);
        break;
      }

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

export const processInteractionObject = (ix: InteractionObject): InteractionObject => {
    return {
      ...ix, 
      participants: processParticipants(ix),
    }
}

const toRawFund = (fund: IxFund): RawIxFund => {
    return { 
        ...fund,
        asset_id: new AssetId(fund.asset_id).toBytes(), 
    }
}

const toRawParticipant = (participant: IxParticipant): RawIxParticipant => {
    return {
        ...participant,
        id: new Identifier(participant.id).toBytes(),
    }
}

const toRawOperation = (operation: any): RawIxOperation => {
    switch (operation.type) {
        case OpType.PARTICIPANT_CREATE: {
            validateParticipantCreate(operation.payload)
            return { 
              ...operation, 
              payload: processParticipantCreate(operation.payload) 
            }
        }
        case OpType.ACCOUNT_CONFIGURE: {
            validateAccountConfigure(operation.payload)
            return {
              ...operation,
              payload: processAccountConfigure(operation.payload)
            }
        }
        case OpType.ACCOUNT_INHERIT: {
            validateAccountInherit(operation.payload)
            return {
              ...operation,
              payload: processAccountInherit(operation.payload)
            }
        }
        case OpType.ASSET_CREATE: {
            validateAssetCreate(operation.payload)
            return {
              ...operation,
              payload: processAssetCreate(operation.payload)
            }
        }
        case OpType.ASSET_INVOKE: {
            validateAssetAction(operation.payload)
            return {
              ...operation,
              payload: processAssetInvoke(operation.payload)
            }
        }
        case OpType.LOGIC_DEPLOY: {
            validateLogicDeploy(operation.payload)
            return { 
              ...operation, 
              payload: processLogicDeploy(operation.payload) 
            }
        }
        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST: {
            validateLogicAction(operation.payload)
            return {
              ...operation,
              payload: processLogicAction(operation.payload)
            }
        }
        case OpType.STORAGE_DEPOSIT: {
            validateStorageDeposit(operation.payload)
            return {
              ...operation,
              payload: processStorageDeposit(operation.payload)
            }
        }
        case OpType.STORAGE_WITHDRAW: {
            validateStorageWithdraw(operation.payload)
            return {
              ...operation,
              payload: processStorageWithdraw(operation.payload)
            }
        }
        case OpType.ACCESS_CREATE:
        case OpType.ACCESS_UPDATE: {
            validateAccessCreateOrUpdate(operation.payload)
            return {
              ...operation,
              payload: processAccessCreateOrUpdate(operation.payload)
            }
        }
        case OpType.ACCESS_DELETE: {
            validateAccessDelete(operation.payload)
            return {
              ...operation,
              payload: processAccessDelete(operation.payload)
            }
        }
        default:
            throw new Error(`Unsupported interaction type: ${operation.type}`)
    }
}

/**
 * Transforms an interaction object to a format that can be serialized to POLO.
 *
 * @param ix Interaction object
 * @returns a raw interaction object
 */
export const toRawInteractionObject = (ix: InteractionObject): RawInteractionObject => {
    ix.participants = processParticipants(ix)
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

export const toRawSignatures = (signs: Signature[]): RawSignature[] => {
    return signs.map(sign => ({
        ...sign,
        id: hexToBytes(sign.id),
        signature: hexToBytes(sign.signature)
    }))
}

const toFundArgs = (fund: IxFund): IxFundArgs => {
  return {
    ...fund,
    amount: toQuantity(fund.amount) as Hex
  }
}

const toOperationArgs = (operation: any): IxOperationArgs => {
  const rawOpPayload = toRawOperation(operation)
  return {
    ...operation,
    payload: "0x" + bytesToHex(rawOpPayload.payload)
  }
}

export const toInteractionArgs = (ix: InteractionObject): InteractionArgs => {
    ix.participants = processParticipants(ix)

    return {
      sender: ix.sender,
      payer: ix.payer ?? ZERO_ADDRESS,
      fuel_price: toQuantity(ix.fuel_price) as Hex,
      fuel_limit: toQuantity(ix.fuel_limit) as Hex,
      funds: ix.funds?.map((fund) => toFundArgs(fund)),
      ix_operations: ix.ix_operations?.map((operation) => toOperationArgs(operation)),
      preferences: ix.preferences ? {
            ...ix.preferences,
            consensus: {
              ...ix.preferences.consensus,
              mtq: toQuantity(ix.preferences.consensus.mtq ?? 0) as Hex
            },
      } : undefined,
      participants: ix.participants
    }
}
