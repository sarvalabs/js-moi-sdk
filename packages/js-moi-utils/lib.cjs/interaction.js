"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockType = exports.TxType = void 0;
/**
 * Enumerates the types of Transactions in the system.
 */
var TxType;
(function (TxType) {
    TxType[TxType["INVALID_IX"] = 0] = "INVALID_IX";
    TxType[TxType["ASSET_TRANSFER"] = 1] = "ASSET_TRANSFER";
    TxType[TxType["FUEL_SUPPLY"] = 2] = "FUEL_SUPPLY";
    TxType[TxType["ASSET_CREATE"] = 3] = "ASSET_CREATE";
    TxType[TxType["ASSET_APPROVE"] = 4] = "ASSET_APPROVE";
    TxType[TxType["ASSET_REVOKE"] = 5] = "ASSET_REVOKE";
    TxType[TxType["ASSET_MINT"] = 6] = "ASSET_MINT";
    TxType[TxType["ASSET_BURN"] = 7] = "ASSET_BURN";
    TxType[TxType["LOGIC_DEPLOY"] = 8] = "LOGIC_DEPLOY";
    TxType[TxType["LOGIC_INVOKE"] = 9] = "LOGIC_INVOKE";
    TxType[TxType["LOGIC_ENLIST"] = 10] = "LOGIC_ENLIST";
    TxType[TxType["LOGIC_INTERACT"] = 11] = "LOGIC_INTERACT";
    TxType[TxType["LOGIC_UPGRADE"] = 12] = "LOGIC_UPGRADE";
    TxType[TxType["FILE_CREATE"] = 13] = "FILE_CREATE";
    TxType[TxType["FILE_UPDATE"] = 14] = "FILE_UPDATE";
    TxType[TxType["PARTICIPANT_REGISTER"] = 15] = "PARTICIPANT_REGISTER";
    TxType[TxType["VALIDATOR_REGISTER"] = 16] = "VALIDATOR_REGISTER";
    TxType[TxType["VALIDATOR_UNREGISTER"] = 17] = "VALIDATOR_UNREGISTER";
    TxType[TxType["STAKE_BOND"] = 18] = "STAKE_BOND";
    TxType[TxType["STAKE_UNBOND"] = 19] = "STAKE_UNBOND";
    TxType[TxType["STAKE_TRANSFER"] = 20] = "STAKE_TRANSFER";
})(TxType || (exports.TxType = TxType = {}));
/**
 * Enumerates the types of particpant locks in the system.
 */
var LockType;
(function (LockType) {
    LockType[LockType["READ_ONLY_LOCK"] = 0] = "READ_ONLY_LOCK";
    LockType[LockType["MUTATE_LOCK"] = 1] = "MUTATE_LOCK";
    LockType[LockType["OBSERVER_LOCK"] = 2] = "OBSERVER_LOCK";
})(LockType || (exports.LockType = LockType = {}));
//# sourceMappingURL=interaction.js.map