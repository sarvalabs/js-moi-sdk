import { AssetCreationResult, AssetStandard, bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { MAS1 } from "./mas1";
import { documentEncode, Schema } from "js-polo";
import {
  MINT_NFT_SCHEMA,
  BURN_NFT_SCHEMA,
  TRANSFER_NFT_SCHEMA,
  APPROVE_NFT_SCHEMA,
  SET_APPROVAL_FOR_ALL_SCHEMA
} from "./mas1-schemas";
import { Signer } from "js-moi-signer";
import { AssetCreatePayload, IxParticipant } from "js-moi-providers";
import { InteractionContext } from "js-moi-wallet";

export class MAS1AssetLogic {
  assetId: string;
  signer: Signer;

  constructor(assetId: string, signer: Signer) {
    this.assetId = assetId;
    this.signer = signer;
  }

  private polorize<T extends MAS1.OperationPayload>(payload: T, schema: Schema): Uint8Array {
    const document = documentEncode(payload, schema);
    return document.bytes();
  }

  static async newAsset(
    signer: Signer,
    symbol: string,
    maxTokens: number | bigint,
    manager: string,
    enableEvents: boolean
  ): Promise<MAS1AssetLogic> {
    const response = await this.create(signer, symbol, maxTokens, manager, enableEvents).send();
    const result: AssetCreationResult = await response.result();
    return new MAS1AssetLogic(result[0].asset_id, signer);
  }

  static create(
    signer: Signer,
    symbol: string,
    maxTokens: number | bigint,
    manager: string,
    enableEvents: boolean
  ): InteractionContext<OpType.ASSET_CREATE> {
    const payload: AssetCreatePayload = {
      symbol: symbol,
      max_supply: maxTokens,
      standard: AssetStandard.MAS1,
      dimension: 1, // NFT-like (unique tokens) — adjust if your system expects a different value
      enable_events: enableEvents,
      manager: manager as Hex,
    };

    return new InteractionContext<OpType.ASSET_CREATE>({
      opType: OpType.ASSET_CREATE,
      payload: payload,
      participants: [],
      signer: signer,
    });
  }

  /**
   * Mint a new NFT with a specific token_id to beneficiary.
   * tokenId should be unique (number | bigint).
   */
  public mint(beneficiary: string, tokenId: number | bigint, metadata?: Uint8Array): InteractionContext<OpType.ASSET_INVOKE> {
    const payload: MAS1.Mint = {
      beneficiary: hexToBytes(beneficiary),
      token_id: tokenId,
      // Optional metadata blob for NFT (if MAS1 supports it).
      metadata: metadata ?? new Uint8Array(0),
    };

    const participants: IxParticipant[] = [
      {
        id: this.assetId as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
      {
        id: beneficiary as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
    ];

    const rawPayload = this.polorize<MAS1.Mint>(payload, MINT_NFT_SCHEMA);

    return new InteractionContext<OpType.ASSET_INVOKE>({
      opType: OpType.ASSET_INVOKE,
      payload: {
        asset_id: this.assetId as Hex,
        callsite: MAS1.Endpoint.MINT,
        calldata: bytesToHex(rawPayload) as Hex,
      },
      participants: participants,
      signer: this.signer,
    });
  }

  /**
   * Burn (destroy) a single NFT by token id.
   */
  public burn(tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
    const payload: MAS1.Burn = {
      token_id: tokenId,
    };

    const participants: IxParticipant[] = [
      {
        id: this.assetId as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
    ];

    const rawPayload = this.polorize<MAS1.Burn>(payload, BURN_NFT_SCHEMA);

    return new InteractionContext<OpType.ASSET_INVOKE>({
      opType: OpType.ASSET_INVOKE,
      payload: {
        asset_id: this.assetId as Hex,
        callsite: MAS1.Endpoint.BURN,
        calldata: bytesToHex(rawPayload) as Hex,
      },
      participants: participants,
      signer: this.signer,
    });
  }

  /**
   * Transfer a token from `from` to `to`. For convenience this method assumes caller has rights.
   */
  public transfer(from: string, to: string, tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
    const payload: MAS1.Transfer = {
      from: hexToBytes(from),
      to: hexToBytes(to),
      token_id: tokenId,
    };

    const participants: IxParticipant[] = [
      {
        id: from as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
      {
        id: to as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
      {
        id: this.assetId as Hex,
        lock_type: LockType.NO_LOCK,
      },
    ];

    const rawPayload = this.polorize<MAS1.Transfer>(payload, TRANSFER_NFT_SCHEMA);

    return new InteractionContext<OpType.ASSET_INVOKE>({
      opType: OpType.ASSET_INVOKE,
      payload: {
        asset_id: this.assetId as Hex,
        callsite: MAS1.Endpoint.TRANSFER,
        calldata: bytesToHex(rawPayload) as Hex,
      },
      participants: participants,
      signer: this.signer,
    });
  }

  /**
   * Approve a single address to manage the given tokenId.
   */
  public approve(approved: string, tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
    const payload: MAS1.Approve = {
      approved: hexToBytes(approved),
      token_id: tokenId,
    };

    const participants: IxParticipant[] = [
      {
        id: approved as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
      {
        id: this.assetId as Hex,
        lock_type: LockType.NO_LOCK,
      },
    ];

    const rawPayload = this.polorize<MAS1.Approve>(payload, APPROVE_NFT_SCHEMA);

    return new InteractionContext<OpType.ASSET_INVOKE>({
      opType: OpType.ASSET_INVOKE,
      payload: {
        asset_id: this.assetId as Hex,
        callsite: MAS1.Endpoint.APPROVE,
        calldata: bytesToHex(rawPayload) as Hex,
      },
      participants: participants,
      signer: this.signer,
    });
  }

  /**
   * Set or unset operator approval (approve all) for an operator address.
   */
  public setApprovalForAll(operator: string, approved: boolean): InteractionContext<OpType.ASSET_INVOKE> {
    const payload: MAS1.SetApprovalForAll = {
      operator: hexToBytes(operator),
      approved: approved,
    };

    const participants: IxParticipant[] = [
      {
        id: operator as Hex,
        lock_type: LockType.MUTATE_LOCK,
      },
      {
        id: this.assetId as Hex,
        lock_type: LockType.NO_LOCK,
      },
    ];

    const rawPayload = this.polorize<MAS1.SetApprovalForAll>(payload, SET_APPROVAL_FOR_ALL_SCHEMA);

    return new InteractionContext<OpType.ASSET_INVOKE>({
      opType: OpType.ASSET_INVOKE,
      payload: {
        asset_id: this.assetId as Hex,
        callsite: MAS1.Endpoint.SET_APPROVAL_FOR_ALL,
        calldata: bytesToHex(rawPayload) as Hex,
      },
      participants: participants,
      signer: this.signer,
    });
  }

  /**
   * Convenience: revoke approval for a specific token (set approved to zero / null).
   */
  public revokeApproval(tokenId: number | bigint): InteractionContext<OpType.ASSET_INVOKE> {
    // Many ERC721 implementations approve a zero address to revoke. Adjust if your MAS1 has an explicit revoke call.
    return this.approve("0x0000000000000000000000000000000000000000", tokenId);
  }
}
