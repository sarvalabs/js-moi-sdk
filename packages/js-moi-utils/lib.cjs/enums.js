"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementType = exports.CallsiteKind = exports.LogicState = exports.EngineKind = exports.OperationStatus = exports.ReceiptStatus = exports.AccountType = exports.LockType = exports.OpType = exports.AssetStandard = void 0;
/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
var AssetStandard;
(function (AssetStandard) {
    AssetStandard[AssetStandard["MAS0"] = 0] = "MAS0";
    AssetStandard[AssetStandard["MAS1"] = 1] = "MAS1";
})(AssetStandard || (exports.AssetStandard = AssetStandard = {}));
/**
 * Enumerates the types of Operations in the system.
 */
var OpType;
(function (OpType) {
    OpType[OpType["Invalid"] = 0] = "Invalid";
    OpType[OpType["ParticipantCreate"] = 1] = "ParticipantCreate";
    OpType[OpType["AccountConfigure"] = 2] = "AccountConfigure";
    OpType[OpType["AssetTransfer"] = 3] = "AssetTransfer";
    OpType[OpType["FuelSupply"] = 4] = "FuelSupply";
    OpType[OpType["AssetCreate"] = 5] = "AssetCreate";
    OpType[OpType["AssetApprove"] = 6] = "AssetApprove";
    OpType[OpType["AssetRevoke"] = 7] = "AssetRevoke";
    OpType[OpType["AssetMint"] = 8] = "AssetMint";
    OpType[OpType["AssetBurn"] = 9] = "AssetBurn";
    OpType[OpType["AssetLockup"] = 10] = "AssetLockup";
    OpType[OpType["AssetRelease"] = 11] = "AssetRelease";
    OpType[OpType["LogicDeploy"] = 12] = "LogicDeploy";
    OpType[OpType["LogicInvoke"] = 13] = "LogicInvoke";
    OpType[OpType["LogicEnlist"] = 14] = "LogicEnlist";
    OpType[OpType["LogicInteract"] = 15] = "LogicInteract";
    OpType[OpType["LogicUpgrade"] = 16] = "LogicUpgrade";
})(OpType || (exports.OpType = OpType = {}));
/**
 * Enumerates the types of participant locks in the system.
 */
var LockType;
(function (LockType) {
    LockType[LockType["MutateLock"] = 0] = "MutateLock";
    LockType[LockType["ReadLock"] = 1] = "ReadLock";
    LockType[LockType["NoLock"] = 2] = "NoLock";
})(LockType || (exports.LockType = LockType = {}));
/**
 * Enumerates the types of participant keys in the system.
 */
var AccountType;
(function (AccountType) {
    AccountType[AccountType["SargaAccount"] = 0] = "SargaAccount";
    AccountType[AccountType["LogicAccount"] = 2] = "LogicAccount";
    AccountType[AccountType["AssetAccount"] = 3] = "AssetAccount";
    AccountType[AccountType["RegularAccount"] = 4] = "RegularAccount";
})(AccountType || (exports.AccountType = AccountType = {}));
var ReceiptStatus;
(function (ReceiptStatus) {
    ReceiptStatus[ReceiptStatus["Ok"] = 0] = "Ok";
    ReceiptStatus[ReceiptStatus["StateReverted"] = 1] = "StateReverted";
    ReceiptStatus[ReceiptStatus["InsufficientFuel"] = 2] = "InsufficientFuel";
})(ReceiptStatus || (exports.ReceiptStatus = ReceiptStatus = {}));
var OperationStatus;
(function (OperationStatus) {
    OperationStatus[OperationStatus["Ok"] = 0] = "Ok";
    OperationStatus[OperationStatus["ExceptionRaised"] = 1] = "ExceptionRaised";
    OperationStatus[OperationStatus["StateReverted"] = 2] = "StateReverted";
    OperationStatus[OperationStatus["FuelExhausted"] = 3] = "FuelExhausted";
})(OperationStatus || (exports.OperationStatus = OperationStatus = {}));
var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind || (exports.EngineKind = EngineKind = {}));
var LogicState;
(function (LogicState) {
    LogicState["Persistent"] = "persistent";
    LogicState["Ephemeral"] = "ephemeral";
})(LogicState || (exports.LogicState = LogicState = {}));
var CallsiteKind;
(function (CallsiteKind) {
    CallsiteKind["Invoke"] = "invoke";
    CallsiteKind["Deploy"] = "deploy";
})(CallsiteKind || (exports.CallsiteKind = CallsiteKind = {}));
var ElementType;
(function (ElementType) {
    ElementType["Constant"] = "constant";
    ElementType["Typedef"] = "typedef";
    ElementType["Class"] = "class";
    ElementType["State"] = "state";
    ElementType["Routine"] = "routine";
    ElementType["Method"] = "method";
    ElementType["Event"] = "event";
})(ElementType || (exports.ElementType = ElementType = {}));
//# sourceMappingURL=enums.js.map