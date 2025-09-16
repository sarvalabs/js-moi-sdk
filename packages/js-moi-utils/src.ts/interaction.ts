/**
 * Enumerates the types of Operations in the system.
 */
export enum OpType {
    INVALID_IX,
    PARTICIPANT_CREATE,
    ACCOUNT_CONFIGURE,
    ACCOUNT_INHERIT,

    ASSET_CREATE,
    ASSET_INVOKE,

    LOGIC_DEPLOY,
    LOGIC_INVOKE,
    LOGIC_ENLIST,
    LOGIC_INTERACT,
    LOGIC_UPGRADE,
}

/**
 * Enumerates the types of particpant locks in the system.
 */
export enum LockType {
    MUTATE_LOCK,
    READ_LOCK,
    NO_LOCK
}
