import {
  AssetCreatePayload,
  AssetActionPayload,
  IxParticipant,
  InteractionResponse,
  AnyIxOperation,
  ParticipantCreatePayload,
  AccountConfigurePayload,
  AccountInheritPayload,
  InteractionCallResponse
} from "js-moi-providers";

import { Signer } from "js-moi-signer";
import { OpType } from "js-moi-utils";
import { DEFAULT_FUEL_PRICE, DEFAULT_FUEL_LIMIT } from "js-moi-constants";

/**
 * Represents all valid operation types supported by InteractionContext.
 */
export type AllowedOps =
  | OpType.ASSET_CREATE
  | OpType.ASSET_INVOKE
  | OpType.PARTICIPANT_CREATE
  | OpType.ACCOUNT_CONFIGURE
  | OpType.ACCOUNT_INHERIT;

/**
 * Maps operation types to their expected payloads.
 */
type OperationMap = {
  [OpType.ASSET_CREATE]: AssetCreatePayload;
  [OpType.ASSET_INVOKE]: AssetActionPayload;
  [OpType.PARTICIPANT_CREATE]: ParticipantCreatePayload;
  [OpType.ACCOUNT_CONFIGURE]: AccountConfigurePayload;
  [OpType.ACCOUNT_INHERIT]: AccountInheritPayload;
};

/**
 * Context object describing the state of an interaction.
 */
interface Context<T extends AllowedOps> {
  opType: T;
  payload: OperationMap[T];
  participants: IxParticipant[];
  signer: Signer;
}

/**
 * Optional configuration for executing an interaction.
 */
export interface IxOption {
  fuel_price?: number;
  fuel_limit?: number;
  participants?: IxParticipant[];
}

/**
 * A unified context class that encapsulates the full lifecycle of
 * a Moi interaction — from building the operation to executing
 * (send/call/estimate).
 */
export class InteractionContext<T extends AllowedOps> {
  private readonly ctx: Context<T>;

  constructor(ctx: Context<T>) {
    this.ctx = ctx;
  }

  /** Returns the operation type for this interaction. */
  public type(): OpType {
    return this.ctx.opType;
  }

  /** Returns the payload associated with this interaction. */
  public payload(): OperationMap[T] {
    return this.ctx.payload;
  }

  /** Returns all participants involved in this interaction. */
  public participants(): IxParticipant[] {
    return this.ctx.participants;
  }

  /** @internal Builds the base sender object for all calls. */
  private async buildSender() {
    const { signer } = this.ctx;
    const [identifier, nonce, keyId] = await Promise.all([
      signer.getIdentifier(),
      signer.getNonce(),
      signer.getKeyId(),
    ]);

    return {
      id: identifier.toHex(),
      sequence: nonce as number,
      key_id: keyId,
    };
  }

  /** @internal Builds the interaction operation. */
  private buildOperation(): Extract<AnyIxOperation, { type: T }> {
    return {
      type: this.ctx.opType,
      payload: this.ctx.payload,
    } as Extract<AnyIxOperation, { type: T }>;
  }

  /** @internal Combines base and additional participants. */
  private mergeParticipants(option?: IxOption): IxParticipant[] {
    const base = this.ctx.participants ?? [];
    const extra = option?.participants ?? [];
    return [...base, ...extra];
  }

  /**
   * Sends a transaction to the network, committing changes.
   * @param option Optional configuration such as fuel price or participants
   */
  public async send(option?: IxOption): Promise<InteractionResponse> {
    const { signer } = this.ctx;
    const sender = await this.buildSender();

    return signer.sendInteraction({
      sender,
      fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
      fuel_limit: option?.fuel_limit ?? DEFAULT_FUEL_LIMIT,
      ix_operations: [this.buildOperation()],
      participants: this.mergeParticipants(option),
    });
  }

  /**
   * Executes a read-only call (no state changes).
   * @param option Optional configuration such as additional participants
   */
  public async call(option?: IxOption): Promise<InteractionCallResponse> {
    const { signer } = this.ctx;
    const sender = await this.buildSender();

    return signer.call({
      sender,
      fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
      fuel_limit: option?.fuel_limit ?? DEFAULT_FUEL_LIMIT,
      ix_operations: [this.buildOperation()],
      participants: this.mergeParticipants(option),
    });
  }

  /**
   * Estimates the fuel cost for this interaction.
   * @param option Optional configuration such as additional participants
   */
  public async estimateFuel(option?: IxOption): Promise<number | bigint> {
    const { signer } = this.ctx;
    const sender = await this.buildSender();

    return signer.estimateFuel({
      sender,
      fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
      fuel_limit: option?.fuel_limit ?? DEFAULT_FUEL_LIMIT,
      ix_operations: [this.buildOperation()],
      participants: this.mergeParticipants(option),
    });
  }
}
