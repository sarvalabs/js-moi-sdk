/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
export enum AssetStandard {
  MAS0 = 0,
  MAS1 = 1,
  MAS2 = 2,
  MASX = 65535,
  MASN = 65534,
}

/**
 * Enumerates the types of operations in the system.
 */
export enum OpType {
  INVALID_IX,
  PARTICIPANT_CREATE,
  ACCOUNT_CONFIGURE,
  ACCOUNT_INHERIT,

  ASSET_CREATE,
  ASSET_INVOKE,

  GUARDIAN_REGISTER,
  GUARDIAN_STAKE,
  GUARDIAN_UNSTAKE,
  GUARDIAN_WITHDRAW,
  GUARDIAN_CLAIM,

  LOGIC_DEPLOY,
  LOGIC_INVOKE,
  LOGIC_ENLIST,
  LOGIC_INTERACT,
  LOGIC_UPGRADE,

  STORAGE_DEPOSIT,
  STORAGE_WITHDRAW,

  ACCESS_CREATE,
  ACCESS_UPDATE,
  ACCESS_DELETE,
}

/**
 * Enumerates the types of resources an access policy can govern.
 * Only STORAGE is implemented on the network today; ASSET/LOGIC/KEY are
 * reserved values that validate but are rejected server-side.
 */
export enum ResourceType {
  STORAGE = 1,
  ASSET = 2,
  LOGIC = 3,
  KEY = 4,
}

/**
 * Enumerates the actions an access policy can permit. Bitmask - values
 * can be OR'd together, there's no implication between bits.
 */
export enum AccessAction {
  STORAGE_MUTATE = 1 << 0,
  ASSET_ACCESS = 1 << 1,
  LOGIC_ACCESS = 1 << 2,
}

/**
 * Enumerates how a CallerConstraint matches against a caller/origin.
 */
export enum CallerKind {
  ANY = 0,
  SET = 1,
}

/**
 * Enumerates the types of particpant locks in the system.
 */
export enum LockType {
  MUTATE_LOCK,
  READ_LOCK,
  NO_LOCK,
}

/**
 * Enumerates the types of participant keys in the system.
 */
export enum AccountType {
  SARGA_ACCOUNT = 0,
  LOGIC_ACCOUNT = 2,
  ASSET_ACCOUNT = 3,
  REGULAR_ACCOUNT = 4,
}

// Enumerates the status of the interaction after processing.
export enum ReceiptStatus {
  RECEIPT_Ok = 0,
  RECEIPT_STATE_REVERTED = 1,
  RECEIPT_INSUFFICIENT_FUEL = 2,
}

// Enumerates the status of the operation after processing.
export enum OperationStatus {
  RESULT_OK = 0,
  RESULT_EXCEPTION_RAISED = 1,
  RESULT_DEFECT_RAISED = 2,
}

// Enumerates the kind of engine
export enum EngineKind {
  PISA = "PISA",
  MERU = "MERU",
}

// Enumerates the types of routine
export enum RoutineType {
  INVOKE = "invoke",
  DEPLOY = "deploy",
  ENLIST = "enlist",
}

// Enumerates the types of logic element
export enum ElementType {
  CONSTANT = "constant",
  TYPEDEF = "typedef",
  CLASS = "class",
  STATE = "state",
  ROUTINE = "callable",
  METHOD = "method",
  EVENT = "event",
}

// Enumerates the status of interaction
export enum InteractionStatus {
  PENDING = 0,
  FINALIZED = 1,
}

// Enumerates the types of network
export enum Chain {
  TEST_NET = 111,
  DEV_NET = 112,
  MAIN_NET = 113,
}
