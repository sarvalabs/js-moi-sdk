/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
export declare enum AssetStandard {
    MAS0 = 0,
    MAS1 = 1,
    MAS2 = 2,
    MASX = 65535
}
/**
 * Enumerates the types of operations in the system.
 */
export declare enum OpType {
    INVALID_IX = 0,
    PARTICIPANT_CREATE = 1,
    ACCOUNT_CONFIGURE = 2,
    ACCOUNT_INHERIT = 3,
    ASSET_CREATE = 4,
    ASSET_INVOKE = 5,
    GUARDIAN_REGISTER = 6,
    GUARDIAN_STAKE = 7,
    GUARDIAN_UNSTAKE = 8,
    GUARDIAN_WITHDRAW = 9,
    GUARDIAN_CLAIM = 10,
    LOGIC_DEPLOY = 11,
    LOGIC_INVOKE = 12,
    LOGIC_ENLIST = 13,
    LOGIC_INTERACT = 14,
    LOGIC_UPGRADE = 15,
    STORAGE_DEPOSIT = 16,
    STORAGE_WITHDRAW = 17,
    ACCESS_CREATE = 18,
    ACCESS_UPDATE = 19,
    ACCESS_DELETE = 20
}
/**
 * Enumerates the types of resources an access policy can govern.
 * Only STORAGE is implemented on the network today; ASSET/LOGIC/KEY are
 * reserved values that validate but are rejected server-side.
 */
export declare enum ResourceType {
    STORAGE = 1,
    ASSET = 2,
    LOGIC = 3,
    KEY = 4
}
/**
 * Enumerates the actions an access policy can permit. Bitmask - values
 * can be OR'd together, there's no implication between bits.
 */
export declare enum AccessAction {
    STORAGE_MUTATE = 1,
    ASSET_ACCESS = 2,
    LOGIC_ACCESS = 4
}
/**
 * Enumerates how a CallerConstraint matches against a caller/origin.
 */
export declare enum CallerKind {
    ANY = 0,
    SET = 1
}
/**
 * Enumerates the types of particpant locks in the system.
 */
export declare enum LockType {
    MUTATE_LOCK = 0,
    READ_LOCK = 1,
    NO_LOCK = 2
}
/**
 * Enumerates the types of participant keys in the system.
 */
export declare enum AccountType {
    SARGA_ACCOUNT = 0,
    LOGIC_ACCOUNT = 2,
    ASSET_ACCOUNT = 3,
    REGULAR_ACCOUNT = 4
}
export declare enum ReceiptStatus {
    RECEIPT_Ok = 0,
    RECEIPT_STATE_REVERTED = 1,
    RECEIPT_INSUFFICIENT_FUEL = 2
}
export declare enum OperationStatus {
    RESULT_OK = 0,
    RESULT_EXCEPTION_RAISED = 1,
    RESULT_DEFECT_RAISED = 2
}
export declare enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}
export declare enum LogicState {
    PERSISTENT = "persistent",
    EPHEMERAL = "ephemeral"
}
export declare enum RoutineKind {
    PERSISTENT = "persistent",
    EPHEMERAL = "ephemeral",
    READ_ONLY = "readonly"
}
export declare enum RoutineType {
    INVOKE = "invoke",
    DEPLOY = "deploy",
    ENLIST = "enlist"
}
export declare enum ElementType {
    CONSTANT = "constant",
    TYPEDEF = "typedef",
    CLASS = "class",
    STATE = "state",
    ROUTINE = "callable",
    METHOD = "method",
    EVENT = "event"
}
export declare enum InteractionStatus {
    PENDING = 0,
    FINALIZED = 1
}
export declare enum Chain {
    TEST_NET = 111,
    DEV_NET = 112,
    MAIN_NET = 113
}
//# sourceMappingURL=enums.d.ts.map