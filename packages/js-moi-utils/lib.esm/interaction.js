/**
 * Enumerates the types of Operations in the system.
 */
export var OpType;
(function (OpType) {
    OpType[OpType["INVALID_IX"] = 0] = "INVALID_IX";
    OpType[OpType["PARTICIPANT_CREATE"] = 1] = "PARTICIPANT_CREATE";
    OpType[OpType["ACCOUNT_CONFIGURE"] = 2] = "ACCOUNT_CONFIGURE";
    OpType[OpType["ACCOUNT_INHERIT"] = 3] = "ACCOUNT_INHERIT";
    OpType[OpType["ASSET_CREATE"] = 4] = "ASSET_CREATE";
    OpType[OpType["ASSET_INVOKE"] = 5] = "ASSET_INVOKE";
    OpType[OpType["LOGIC_DEPLOY"] = 6] = "LOGIC_DEPLOY";
    OpType[OpType["LOGIC_INVOKE"] = 7] = "LOGIC_INVOKE";
    OpType[OpType["LOGIC_ENLIST"] = 8] = "LOGIC_ENLIST";
    OpType[OpType["LOGIC_INTERACT"] = 9] = "LOGIC_INTERACT";
    OpType[OpType["LOGIC_UPGRADE"] = 10] = "LOGIC_UPGRADE";
})(OpType || (OpType = {}));
/**
 * Enumerates the types of particpant locks in the system.
 */
export var LockType;
(function (LockType) {
    LockType[LockType["MUTATE_LOCK"] = 0] = "MUTATE_LOCK";
    LockType[LockType["READ_LOCK"] = 1] = "READ_LOCK";
    LockType[LockType["NO_LOCK"] = 2] = "NO_LOCK";
})(LockType || (LockType = {}));
//# sourceMappingURL=interaction.js.map