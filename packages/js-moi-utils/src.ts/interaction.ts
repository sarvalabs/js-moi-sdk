/**
 * Enumerates the types of Operations in the system.
 */
export enum OpType {
    Invalid,
    ParticipantCreate,
    AccountConfigure,
    AssetTransfer,
    FuelSupply, // TODO: Remove this
    AssetCreate,
    AssetApprove,
    AssetRevoke,
    AssetMint,
    AssetBurn,
    AssetLockup,
    AssetRelease,

    LogicDeploy,
    LogicInvoke,
    LogicEnlist,
    LogicInteract,
    LogicUpgrade,
}

/**
 * Enumerates the types of particpant locks in the system.
 */
export enum LockType {
    MutateLock,
    ReadLock,
    NoLock,
}

/**
 * Enumerates the types of participant keys in the system.
 */
export enum AccountType {
    SargaAccount = 0,
    LogicAccount = 2,
    AssetAccount = 3,
    RegularAccount = 4,
}
