import { InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Hex, OpType } from "js-moi-utils";
import { InteractionContext } from "./context";

export class StorageDeposit {
  private _target?: Hex;
  private _depositFor?: Hex;
  private _amount?: number | bigint;
  private signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  public target(account: Hex): StorageDeposit {
    this._target = account;

    return this;
  }

  /** Who gets credited with the resulting allowance. Defaults to the signer. */
  public for(participant: Hex): StorageDeposit {
    this._depositFor = participant;

    return this;
  }

  public amount(kmoi: number | bigint): StorageDeposit {
    this._amount = kmoi;

    return this;
  }

  public async build(): Promise<InteractionContext<OpType.STORAGE_DEPOSIT>> {
    if (this._target == null) throw new Error("target account is required");
    if (this._amount == null) throw new Error("amount is required");

    const depositFor = this._depositFor ?? (await this.signer.getIdentifier()).toHex();

    return new InteractionContext<OpType.STORAGE_DEPOSIT>({
      opType: OpType.STORAGE_DEPOSIT,
      payload: {
        target_account: this._target,
        deposit_for: depositFor,
        amount: this._amount,
      },
      participants: [],
      signer: this.signer,
    });
  }

  public async send(): Promise<InteractionResponse> {
    const ixnContext = await this.build();

    return await ixnContext.send();
  }
}

export class StorageWithdraw {
  private _target?: Hex;
  private _bytesToRelease = 0;
  private signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  public target(account: Hex): StorageWithdraw {
    this._target = account;

    return this;
  }

  /** Bytes to release. Omit to release everything currently available. */
  public release(bytesToRelease: number): StorageWithdraw {
    this._bytesToRelease = bytesToRelease;

    return this;
  }

  public build(): InteractionContext<OpType.STORAGE_WITHDRAW> {
    if (this._target == null) throw new Error("target account is required");

    return new InteractionContext<OpType.STORAGE_WITHDRAW>({
      opType: OpType.STORAGE_WITHDRAW,
      payload: {
        target_account: this._target,
        bytes_to_release: this._bytesToRelease,
      },
      participants: [],
      signer: this.signer,
    });
  }

  public async send(): Promise<InteractionResponse> {
    const ixnContext = this.build();

    return await ixnContext.send();
  }
}
