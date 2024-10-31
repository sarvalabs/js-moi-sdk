"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockType = exports.TxType = void 0;
/**
 * Enumerates the types of Transactions in the system.
 */
var TxType;
(function (TxType) {
    TxType[TxType["INVALID_IX"] = 0] = "INVALID_IX";
    TxType[TxType["PARTICIPANT_CREATE"] = 1] = "PARTICIPANT_CREATE";
    TxType[TxType["ASSET_TRANSFER"] = 2] = "ASSET_TRANSFER";
    TxType[TxType["FUEL_SUPPLY"] = 3] = "FUEL_SUPPLY";
    TxType[TxType["ASSET_CREATE"] = 4] = "ASSET_CREATE";
    TxType[TxType["ASSET_APPROVE"] = 5] = "ASSET_APPROVE";
    TxType[TxType["ASSET_REVOKE"] = 6] = "ASSET_REVOKE";
    TxType[TxType["ASSET_MINT"] = 7] = "ASSET_MINT";
    TxType[TxType["ASSET_BURN"] = 8] = "ASSET_BURN";
    TxType[TxType["LOGIC_DEPLOY"] = 9] = "LOGIC_DEPLOY";
    TxType[TxType["LOGIC_INVOKE"] = 10] = "LOGIC_INVOKE";
    TxType[TxType["LOGIC_ENLIST"] = 11] = "LOGIC_ENLIST";
    TxType[TxType["LOGIC_INTERACT"] = 12] = "LOGIC_INTERACT";
    TxType[TxType["LOGIC_UPGRADE"] = 13] = "LOGIC_UPGRADE";
    TxType[TxType["FILE_CREATE"] = 14] = "FILE_CREATE";
    TxType[TxType["FILE_UPDATE"] = 15] = "FILE_UPDATE";
    TxType[TxType["PARTICIPANT_REGISTER"] = 16] = "PARTICIPANT_REGISTER";
    TxType[TxType["VALIDATOR_REGISTER"] = 17] = "VALIDATOR_REGISTER";
    TxType[TxType["VALIDATOR_UNREGISTER"] = 18] = "VALIDATOR_UNREGISTER";
    TxType[TxType["STAKE_BOND"] = 19] = "STAKE_BOND";
    TxType[TxType["STAKE_UNBOND"] = 20] = "STAKE_UNBOND";
    TxType[TxType["STAKE_TRANSFER"] = 21] = "STAKE_TRANSFER";
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