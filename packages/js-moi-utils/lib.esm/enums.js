/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
export var AssetStandard;
(function (AssetStandard) {
    AssetStandard[AssetStandard["MAS0"] = 0] = "MAS0";
    AssetStandard[AssetStandard["MAS1"] = 1] = "MAS1";
    AssetStandard[AssetStandard["MAS2"] = 2] = "MAS2";
    AssetStandard[AssetStandard["MASX"] = 65535] = "MASX";
})(AssetStandard || (AssetStandard = {}));
/**
 * Enumerates the types of operations in the system.
 */
export var OpType;
(function (OpType) {
    OpType[OpType["INVALID_IX"] = 0] = "INVALID_IX";
    OpType[OpType["PARTICIPANT_CREATE"] = 1] = "PARTICIPANT_CREATE";
    OpType[OpType["ACCOUNT_CONFIGURE"] = 2] = "ACCOUNT_CONFIGURE";
    OpType[OpType["ACCOUNT_INHERIT"] = 3] = "ACCOUNT_INHERIT";
    OpType[OpType["ASSET_CREATE"] = 4] = "ASSET_CREATE";
    OpType[OpType["ASSET_INVOKE"] = 5] = "ASSET_INVOKE";
    OpType[OpType["GUARDIAN_REGISTER"] = 6] = "GUARDIAN_REGISTER";
    OpType[OpType["GUARDIAN_STAKE"] = 7] = "GUARDIAN_STAKE";
    OpType[OpType["GUARDIAN_UNSTAKE"] = 8] = "GUARDIAN_UNSTAKE";
    OpType[OpType["GUARDIAN_WITHDRAW"] = 9] = "GUARDIAN_WITHDRAW";
    OpType[OpType["GUARDIAN_CLAIM"] = 10] = "GUARDIAN_CLAIM";
    OpType[OpType["LOGIC_DEPLOY"] = 11] = "LOGIC_DEPLOY";
    OpType[OpType["LOGIC_INVOKE"] = 12] = "LOGIC_INVOKE";
    OpType[OpType["LOGIC_ENLIST"] = 13] = "LOGIC_ENLIST";
    OpType[OpType["LOGIC_INTERACT"] = 14] = "LOGIC_INTERACT";
    OpType[OpType["LOGIC_UPGRADE"] = 15] = "LOGIC_UPGRADE";
    OpType[OpType["STORAGE_DEPOSIT"] = 16] = "STORAGE_DEPOSIT";
    OpType[OpType["STORAGE_WITHDRAW"] = 17] = "STORAGE_WITHDRAW";
    OpType[OpType["ACCESS_CREATE"] = 18] = "ACCESS_CREATE";
    OpType[OpType["ACCESS_UPDATE"] = 19] = "ACCESS_UPDATE";
    OpType[OpType["ACCESS_DELETE"] = 20] = "ACCESS_DELETE";
})(OpType || (OpType = {}));
/**
 * Enumerates the types of resources an access policy can govern.
 * Only STORAGE is implemented on the network today; ASSET/LOGIC/KEY are
 * reserved values that validate but are rejected server-side.
 */
export var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["STORAGE"] = 1] = "STORAGE";
    ResourceType[ResourceType["ASSET"] = 2] = "ASSET";
    ResourceType[ResourceType["LOGIC"] = 3] = "LOGIC";
    ResourceType[ResourceType["KEY"] = 4] = "KEY";
})(ResourceType || (ResourceType = {}));
/**
 * Enumerates the actions an access policy can permit. Bitmask - values
 * can be OR'd together, there's no implication between bits.
 */
export var AccessAction;
(function (AccessAction) {
    AccessAction[AccessAction["STORAGE_MUTATE"] = 1] = "STORAGE_MUTATE";
    AccessAction[AccessAction["ASSET_ACCESS"] = 2] = "ASSET_ACCESS";
    AccessAction[AccessAction["LOGIC_ACCESS"] = 4] = "LOGIC_ACCESS";
})(AccessAction || (AccessAction = {}));
/**
 * Enumerates how a CallerConstraint matches against a caller/origin.
 */
export var CallerKind;
(function (CallerKind) {
    CallerKind[CallerKind["ANY"] = 0] = "ANY";
    CallerKind[CallerKind["SET"] = 1] = "SET";
})(CallerKind || (CallerKind = {}));
/**
 * Enumerates the types of particpant locks in the system.
 */
export var LockType;
(function (LockType) {
    LockType[LockType["MUTATE_LOCK"] = 0] = "MUTATE_LOCK";
    LockType[LockType["READ_LOCK"] = 1] = "READ_LOCK";
    LockType[LockType["NO_LOCK"] = 2] = "NO_LOCK";
})(LockType || (LockType = {}));
/**
 * Enumerates the types of participant keys in the system.
 */
export var AccountType;
(function (AccountType) {
    AccountType[AccountType["SARGA_ACCOUNT"] = 0] = "SARGA_ACCOUNT";
    AccountType[AccountType["LOGIC_ACCOUNT"] = 2] = "LOGIC_ACCOUNT";
    AccountType[AccountType["ASSET_ACCOUNT"] = 3] = "ASSET_ACCOUNT";
    AccountType[AccountType["REGULAR_ACCOUNT"] = 4] = "REGULAR_ACCOUNT";
})(AccountType || (AccountType = {}));
// Enumerates the status of the interaction after processing.
export var ReceiptStatus;
(function (ReceiptStatus) {
    ReceiptStatus[ReceiptStatus["RECEIPT_Ok"] = 0] = "RECEIPT_Ok";
    ReceiptStatus[ReceiptStatus["RECEIPT_STATE_REVERTED"] = 1] = "RECEIPT_STATE_REVERTED";
    ReceiptStatus[ReceiptStatus["RECEIPT_INSUFFICIENT_FUEL"] = 2] = "RECEIPT_INSUFFICIENT_FUEL";
})(ReceiptStatus || (ReceiptStatus = {}));
// Enumerates the status of the operation after processing.
export var OperationStatus;
(function (OperationStatus) {
    OperationStatus[OperationStatus["RESULT_OK"] = 0] = "RESULT_OK";
    OperationStatus[OperationStatus["RESULT_EXCEPTION_RAISED"] = 1] = "RESULT_EXCEPTION_RAISED";
    OperationStatus[OperationStatus["RESULT_DEFECT_RAISED"] = 2] = "RESULT_DEFECT_RAISED";
})(OperationStatus || (OperationStatus = {}));
// Enumerates the kind of engine
export var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind || (EngineKind = {}));
// Enumerates the types of logic state
export var LogicState;
(function (LogicState) {
    LogicState["PERSISTENT"] = "persistent";
    LogicState["EPHEMERAL"] = "ephemeral";
})(LogicState || (LogicState = {}));
// Enumerates the kind of routine
export var RoutineKind;
(function (RoutineKind) {
    RoutineKind["PERSISTENT"] = "persistent";
    RoutineKind["EPHEMERAL"] = "ephemeral";
    RoutineKind["READ_ONLY"] = "readonly";
})(RoutineKind || (RoutineKind = {}));
// Enumerates the types of routine
export var RoutineType;
(function (RoutineType) {
    RoutineType["INVOKE"] = "invoke";
    RoutineType["DEPLOY"] = "deploy";
    RoutineType["ENLIST"] = "enlist";
})(RoutineType || (RoutineType = {}));
// Enumerates the types of logic element
export var ElementType;
(function (ElementType) {
    ElementType["CONSTANT"] = "constant";
    ElementType["TYPEDEF"] = "typedef";
    ElementType["CLASS"] = "class";
    ElementType["STATE"] = "state";
    ElementType["ROUTINE"] = "callable";
    ElementType["METHOD"] = "method";
    ElementType["EVENT"] = "event";
})(ElementType || (ElementType = {}));
// Enumerates the status of interaction
export var InteractionStatus;
(function (InteractionStatus) {
    InteractionStatus[InteractionStatus["PENDING"] = 0] = "PENDING";
    InteractionStatus[InteractionStatus["FINALIZED"] = 1] = "FINALIZED";
})(InteractionStatus || (InteractionStatus = {}));
// Enumerates the types of network
export var Chain;
(function (Chain) {
    Chain[Chain["TEST_NET"] = 111] = "TEST_NET";
    Chain[Chain["DEV_NET"] = 112] = "DEV_NET";
    Chain[Chain["MAIN_NET"] = 113] = "MAIN_NET";
})(Chain || (Chain = {}));
//# sourceMappingURL=enums.js.map