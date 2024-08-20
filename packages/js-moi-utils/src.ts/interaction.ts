/**
 * Enumerates the types of Transactions in the system.
 */
export enum TxType {
    INVALID_IX,
    VALUE_TRANSFER,
    FUEL_SUPPLY,

    ASSET_CREATE,
    ASSET_APPROVE,
    ASSET_REVOKE,
    ASSET_MINT,
    ASSET_BURN,

    LOGIC_DEPLOY,
    LOGIC_INVOKE,
    LOGIC_ENLIST,
    LOGIC_INTERACT,
    LOGIC_UPGRADE,

    FILE_CREATE,
    FILE_UPDATE,

    PARTICIPANT_REGISTER,
    VALIDATOR_REGISTER,
    VALIDATOR_UNREGISTER,

    STAKE_BOND,
    STAKE_UNBOND,
    STAKE_TRANSFER
}

/**
 * Enumerates the types of particpant locks in the system.
 */
export enum LockType {
    READ_ONLY_LOCK,
    MUTATE_LOCK,
    OBSERVER_LOCK
}
