/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
export enum AssetStandard {
    MAS0 = 0,
    MAS1 = 1,
}

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
 * Enumerates the types of participant locks in the system.
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

export enum EngineKind {
    PISA = "PISA",
    MERU = "MERU",
}

export enum LogicState {
    Persistent = "persistent",
    Ephemeral = "ephemeral",
}

export enum RoutineType {
    Invoke = "invoke",
    Deploy = "deploy",
}

export enum ElementType {
    Constant = "constant",
    Typedef = "typedef",
    Class = "class",
    State = "state",
    Routine = "routine",
    Method = "method",
    Event = "event",
}

export enum InteractionStatus {
    Queued = 0,
    Pending = 1,
    Finalized = 2,
}
