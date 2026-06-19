import { AssetCreatePayload, AssetActionPayload, ParticipantCreatePayload, AccountConfigurePayload, AccountInheritPayload, LogicDeployPayload, LogicActionPayload, IxParticipant, Sender } from "js-moi-providers";
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
  | OpType.LOGIC_ENLIST;

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
};

/**
 * Context object describing the state of an interaction.
 */
export interface IxContext<T extends AllowedOps> {
  opType: T;
  payload: OperationMap[T];
  participants: IxParticipant[];
  signer: Signer;
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