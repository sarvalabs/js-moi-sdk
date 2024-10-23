/**
 * Enumerates the types of Transactions in the system.
 */
export declare enum TxType {
    INVALID_IX = 0,
    ASSET_TRANSFER = 1,
    FUEL_SUPPLY = 2,
    ASSET_CREATE = 3,
    ASSET_APPROVE = 4,
    ASSET_REVOKE = 5,
    ASSET_MINT = 6,
    ASSET_BURN = 7,
    LOGIC_DEPLOY = 8,
    LOGIC_INVOKE = 9,
    LOGIC_ENLIST = 10,
    LOGIC_INTERACT = 11,
    LOGIC_UPGRADE = 12,
    FILE_CREATE = 13,
    FILE_UPDATE = 14,
    PARTICIPANT_REGISTER = 15,
    VALIDATOR_REGISTER = 16,
    VALIDATOR_UNREGISTER = 17,
    STAKE_BOND = 18,
    STAKE_UNBOND = 19,
    STAKE_TRANSFER = 20
}
/**
 * Enumerates the types of particpant locks in the system.
 */
export declare enum LockType {
    MUTATE_LOCK = 0,
    READ_ONLY_LOCK = 1,
    OBSERVER_LOCK = 2
}
//# sourceMappingURL=interaction.d.ts.map