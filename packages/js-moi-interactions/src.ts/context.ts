import {
  IxParticipant,
  InteractionResponse,
  AnyIxOperation,
  InteractionCallResponse,
  InteractionObject,
} from "js-moi-providers";

import { OpType, trimHexPrefix } from "js-moi-utils";
import { DEFAULT_FUEL_PRICE, DEFAULT_FUEL_LIMIT } from "js-moi-constants";
import { AllowedOps, IxContext, IxOption, OperationMap } from "../types/context";

/**
 * A unified context class that encapsulates the full lifecycle of
 * a Moi interaction — from building the operation to executing
 * (send/call/estimate).
 */
export class InteractionContext<T extends AllowedOps> {
  private readonly ctx: IxContext<T>;

  constructor(ctx: IxContext<T>) {
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

  /** Builds the base sender object, respecting any overrides in option. */
  protected async buildSender(option?: IxOption) {
    if (option?.sender) {
      return option.sender;
    }

    const { signer } = this.ctx;
    const [identifier, keyId] = await Promise.all([
      signer.getIdentifier(),
      signer.getKeyId(),
    ]);

    return {
      id: identifier.toHex(),
      sequence: option?.sequence ?? (await signer.getNonce()) as number,
      key_id: keyId,
    };
  }

  /** Builds the interaction operation. */
  protected buildOperation(): Extract<AnyIxOperation, { type: T }> {
    return {
      type: this.ctx.opType,
      payload: this.ctx.payload,
    } as Extract<AnyIxOperation, { type: T }>;
  }

  /** Merges base and option participants, with option entries overriding base entries by id. */
  protected mergeParticipants(option?: IxOption): IxParticipant[] {
    const merged = new Map<string, IxParticipant>();

    for (const p of this.ctx.participants ?? []) {
      merged.set(trimHexPrefix(p.id), p);
    }

    for (const p of option?.participants ?? []) {
      merged.set(trimHexPrefix(p.id), p);
    }

    return Array.from(merged.values());
  }

  /**
   * Builds and returns the full interaction data object.
   * @param option Optional configuration such as fuel price or participants
   */
  public async ixData(option?: IxOption): Promise<InteractionObject> {
    const sender = await this.buildSender(option);

    return {
      sender,
      fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
      fuel_limit: option?.fuel_limit ?? DEFAULT_FUEL_LIMIT,
      ix_operations: [this.buildOperation()],
      participants: this.mergeParticipants(option),
    };
  }

  /**
   * Sends a transaction to the network, committing changes.
   * @param option Optional configuration such as fuel price or participants
   */
  public async send(option?: IxOption): Promise<InteractionResponse> {
    return this.ctx.signer.sendInteraction(await this.ixData(option));
  }

  /**
   * Executes a read-only call (no state changes).
   * @param option Optional configuration such as additional participants
   */
  public async call(option?: IxOption): Promise<InteractionCallResponse> {
    return this.ctx.signer.call(await this.ixData(option));
  }

  /**
   * Estimates the fuel cost for this interaction.
   * @param option Optional configuration such as additional participants
   */
  public async estimateFuel(option?: IxOption): Promise<number | bigint> {
    return this.ctx.signer.estimateFuel(await this.ixData(option));
  }
}
