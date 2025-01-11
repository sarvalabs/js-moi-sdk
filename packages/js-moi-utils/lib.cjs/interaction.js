"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountType = exports.LockType = exports.OpType = void 0;
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
 * Enumerates the types of particpant locks in the system.
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
//# sourceMappingURL=interaction.js.map