import { AccessDeletePayload, AccessPayload, AnyIxOperation, AssetCreatePayload, AssetActionPayload, ParticipantCreatePayload, AccountConfigurePayload, AccountInheritPayload, LogicDeployPayload, LogicActionPayload, IxParticipant, Sender, StoragePayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";

/**
 * Represents all valid operation types supported by InteractionContext.
 */
export type AllowedOps =
  | OpType.ASSET_CREATE
  | OpType.ASSET_INVOKE
  | OpType.PARTICIPANT_CREATE
  | OpType.ACCOUNT_CONFIGURE
  | OpType.ACCOUNT_INHERIT
  | OpType.LOGIC_DEPLOY
  | OpType.LOGIC_INVOKE
  | OpType.LOGIC_ENLIST
  | OpType.STORAGE_DEPOSIT
  | OpType.STORAGE_WITHDRAW
  | OpType.ACCESS_CREATE
  | OpType.ACCESS_UPDATE
  | OpType.ACCESS_DELETE;

/**
 * Maps operation types to their expected payloads.
 */
export type OperationMap = {
  [OpType.ASSET_CREATE]: AssetCreatePayload;
  [OpType.ASSET_INVOKE]: AssetActionPayload;
  [OpType.PARTICIPANT_CREATE]: ParticipantCreatePayload;
  [OpType.ACCOUNT_CONFIGURE]: AccountConfigurePayload;
  [OpType.ACCOUNT_INHERIT]: AccountInheritPayload;
  [OpType.LOGIC_DEPLOY]: LogicDeployPayload;
  [OpType.LOGIC_INVOKE]: LogicActionPayload;
  [OpType.LOGIC_ENLIST]: LogicActionPayload;
  [OpType.STORAGE_DEPOSIT]: StoragePayload;
  [OpType.STORAGE_WITHDRAW]: StoragePayload;
  [OpType.ACCESS_CREATE]: AccessPayload;
  [OpType.ACCESS_UPDATE]: AccessPayload;
  [OpType.ACCESS_DELETE]: AccessDeletePayload;
};

/**
 * Context object describing the state of an interaction.
 */
export interface IxContext<T extends AllowedOps> {
  opType: T;
  payload: OperationMap[T];
  participants: IxParticipant[];
  signer: Signer;
  /**
   * Additional operations to bundle into the same interaction, alongside the
   * primary op/payload above. Resolved lazily against the sender that will
   * actually sign the interaction (participant id + sequence + key id),
   * since some bundled ops (e.g. funding a not-yet-existing account) depend
   * on values only known once the sender is finalized.
   */
  extraOperations?: (sender: Sender) => AnyIxOperation[] | Promise<AnyIxOperation[]>;
}

/**
 * Optional configuration for executing an interaction.
 */
export interface IxOption {
  sender?: Sender;
  sequence?: number;
  fuel_price?: number;
  fuel_limit?: number;
  participants?: IxParticipant[];
}