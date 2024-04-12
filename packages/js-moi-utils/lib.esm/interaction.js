/**
 * Enumerates the types of Interactions in the system.
 */
export var IxType;
(function (IxType) {
    IxType[IxType["INVALID_IX"] = 0] = "INVALID_IX";
    IxType[IxType["VALUE_TRANSFER"] = 1] = "VALUE_TRANSFER";
    IxType[IxType["FUEL_SUPPLY"] = 2] = "FUEL_SUPPLY";
    IxType[IxType["ASSET_CREATE"] = 3] = "ASSET_CREATE";
    IxType[IxType["ASSET_APPROVE"] = 4] = "ASSET_APPROVE";
    IxType[IxType["ASSET_REVOKE"] = 5] = "ASSET_REVOKE";
    IxType[IxType["ASSET_MINT"] = 6] = "ASSET_MINT";
    IxType[IxType["ASSET_BURN"] = 7] = "ASSET_BURN";
    IxType[IxType["LOGIC_DEPLOY"] = 8] = "LOGIC_DEPLOY";
    IxType[IxType["LOGIC_INVOKE"] = 9] = "LOGIC_INVOKE";
    IxType[IxType["LOGIC_ENLIST"] = 10] = "LOGIC_ENLIST";
    IxType[IxType["LOGIC_INTERACT"] = 11] = "LOGIC_INTERACT";
    IxType[IxType["LOGIC_UPGRADE"] = 12] = "LOGIC_UPGRADE";
    IxType[IxType["FILE_CREATE"] = 13] = "FILE_CREATE";
    IxType[IxType["FILE_UPDATE"] = 14] = "FILE_UPDATE";
    IxType[IxType["PARTICIPANT_REGISTER"] = 15] = "PARTICIPANT_REGISTER";
    IxType[IxType["VALIDATOR_REGISTER"] = 16] = "VALIDATOR_REGISTER";
    IxType[IxType["VALIDATOR_UNREGISTER"] = 17] = "VALIDATOR_UNREGISTER";
    IxType[IxType["STAKE_BOND"] = 18] = "STAKE_BOND";
    IxType[IxType["STAKE_UNBOND"] = 19] = "STAKE_UNBOND";
    IxType[IxType["STAKE_TRANSFER"] = 20] = "STAKE_TRANSFER";
})(IxType || (IxType = {}));
//# sourceMappingURL=interaction.js.map