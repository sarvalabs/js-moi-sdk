/**
 * Enumerates the types of Operations in the system.
 */
export declare enum OpType {
    Invalid = 0,
    ParticipantCreate = 1,
    AccountConfigure = 2,
    AssetTransfer = 3,
    FuelSupply = 4,// TODO: Remove this
    AssetCreate = 5,
    AssetApprove = 6,
    AssetRevoke = 7,
    AssetMint = 8,
    AssetBurn = 9,
    AssetLockup = 10,
    AssetRelease = 11,
    LogicDeploy = 12,
    LogicInvoke = 13,
    LogicEnlist = 14,
    LogicInteract = 15,
    LogicUpgrade = 16
}
/**
 * Enumerates the types of particpant locks in the system.
 */
export declare enum LockType {
    MutateLock = 0,
    ReadLock = 1,
    NoLock = 2
}
/**
 * Enumerates the types of participant keys in the system.
 */
export declare enum AccountType {
    SargaAccount = 0,
    LogicAccount = 2,
    AssetAccount = 3,
    RegularAccount = 4
}
export declare enum ReceiptStatus {
    Ok = 0,
    StateReverted = 1,
    InsufficientFuel = 2
}
export declare enum OperationStatus {
    Ok = 0,
    ExceptionRaised = 1,
    StateReverted = 2,
    FuelExhausted = 3
}
//# sourceMappingURL=interaction.d.ts.map