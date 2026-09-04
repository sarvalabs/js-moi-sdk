import { Hex } from "js-moi-utils";
import { InteractionObject, RawInteractionObject, Signature, RawSignature, InteractionArgs } from "../types/interaction";
import { AccessDeletePayload, AccessPayload, AccessPolicy, AccountConfigurePayload, AccountInheritPayload, AssetActionPayload, AssetCreatePayload, CallerConstraint, KeyAddPayload, KeyRevokePayload, LogicActionPayload, LogicDeployPayload, ParticipantCreatePayload, StoragePayload } from "../types/operation";
export declare const validateKeyAdd: (key: KeyAddPayload, index: number) => void;
export declare const validateKeyRevoke: (key: KeyRevokePayload, index: number) => KeyRevokePayload;
export declare const validateAssetAction: (value: AssetActionPayload) => void;
export declare const validateParticipantCreate: (payload: ParticipantCreatePayload) => void;
export declare const validateAccountConfigure: (payload: AccountConfigurePayload) => void;
export declare const validateAccountInherit: (payload: AccountInheritPayload) => void;
export declare const validateStorageDeposit: (payload: StoragePayload) => void;
export declare const validateStorageWithdraw: (payload: StoragePayload) => void;
export declare const validateCallerConstraint: (constraint: CallerConstraint, label: string) => void;
export declare const validateAccessPolicy: (policy: AccessPolicy) => void;
export declare const validateAccessCreateOrUpdate: (payload: AccessPayload) => void;
export declare const validateAccessDelete: (payload: AccessDeletePayload) => void;
export declare const validateLogicPayload: (payload: LogicDeployPayload | LogicActionPayload) => void;
export declare const validateLogicDeploy: (payload: LogicDeployPayload) => void;
export declare const validateLogicAction: (payload: LogicActionPayload) => void;
export declare const validateAssetCreate: (payload: AssetCreatePayload) => AssetCreatePayload;
export declare const processInteractionObject: (ix: InteractionObject) => InteractionObject;
/**
 * Transforms an interaction object to a format that can be serialized to POLO.
 *
 * @param ix Interaction object
 * @returns a raw interaction object
 */
export declare const toRawInteractionObject: (ix: InteractionObject) => RawInteractionObject;
export declare const toRawSignatures: (signs: Signature[]) => RawSignature[];
export declare const rawSignaturesToSignatures: (rawSignatures: RawSignature[]) => Signature[];
export declare const toInteractionArgs: (ix: InteractionObject) => InteractionArgs;
/**
 * Checks whether a signature array contains an entry for the given participant
 * identifier.
 *
 * @param {Signature[]} signatures - Parsed signature entries.
 * @param {Hex} participantId - Participant identifier to look for.
 * @returns {boolean} `true` when a matching signature entry exists.
 */
export declare const checkSignature: (signatures: Signature[], participantId: Hex) => boolean;
//# sourceMappingURL=interaction.d.ts.map