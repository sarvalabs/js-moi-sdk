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

export enum ReceiptStatus {
    Ok = 0,
    StateReverted = 1,
    InsufficientFuel = 2,
}

export enum OperationStatus {
    Ok = 0,
    ExceptionRaised = 1,
    StateReverted = 2,
    FuelExhausted = 3,
}
