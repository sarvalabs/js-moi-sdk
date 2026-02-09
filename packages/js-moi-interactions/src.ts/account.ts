import { KeyAddPayload, KeyRevokePayload, AssetActionPayload, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { bytesToHex, Hex, hexToBytes, LockType, OpType } from "js-moi-utils";
import { KMOI_ASSET_ID } from "js-moi-constants";
import { documentEncode } from "js-polo";
import { InteractionContext } from "./context";
import { TRANSFER_SCHEMA } from "./schema";

export class AccountConfigure {
    private _add: KeyAddPayload[] = [];
    private _revoke: KeyRevokePayload[] = [];
    private signer: Signer;

    constructor(signer: Signer) {
      this.signer = signer;
    }

    public addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): AccountConfigure {
      this._add.push({ 
          public_key: publicKey, 
          weight, 
          signature_algorithm: signatureAlgorithm,
      });

      return this;
    }

    public revokeKey(keyId: number): AccountConfigure {
      this._revoke.push({ key_id: keyId });
      
      return this;
    }

    public build(): InteractionContext<OpType.ACCOUNT_CONFIGURE> {
      if (
          (this._add == null && this._revoke == null) || 
          (this._add.length === 0 && this._revoke.length === 0)
      ) {
          throw new Error("either add or revoke payload is required") 
      }

      return new InteractionContext<OpType.ACCOUNT_CONFIGURE>({
          opType: OpType.ACCOUNT_CONFIGURE,
          payload: {
            add: this._add,
            revoke: this._revoke
          },
          participants: [],
          signer: this.signer,
      })
    }

    public async send(): Promise<InteractionResponse> {
      const ixnContext = this.build()

      return await ixnContext.send()
    }
}

export class AccountInherit {
  private _target?: Hex;
  private _value?: AssetActionPayload;
  private _index?: number;
  private signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  public target(account: Hex): AccountInherit {
    this._target = account;

    return this;
  }

  public value(assetId: Hex, beneficiary: Hex, amount: number | bigint): AccountInherit {
    const transferPayload = {
        beneficiary: hexToBytes(beneficiary),
        amount: amount
    }

    const calldata = documentEncode(transferPayload, TRANSFER_SCHEMA)

    this._value = { 
      asset_id: assetId, 
      callsite: "Transfer", 
      calldata: bytesToHex(calldata.bytes()) as Hex, 
      // Todo: add funds when required
    };

    return this;
  }

  public index(idx: number): AccountInherit {
    this._index = idx;

    return this;
  }

  public build(): InteractionContext<OpType.ACCOUNT_INHERIT> {
    if (this._target == null) throw new Error("target account is required");
    if (this._value == null) throw new Error("asset payload is required");
    if (this._index === undefined) throw new Error("sub account index is required");

    return new InteractionContext<OpType.ACCOUNT_INHERIT>({
        opType: OpType.ACCOUNT_INHERIT,
        payload: {
          target_account: this._target,
          value: this._value,
          sub_account_index: this._index
        },
        participants: [
            {
              id: KMOI_ASSET_ID,
              lock_type: LockType.NO_LOCK,
            }
        ],
        signer: this.signer,
    })
  }

  public async send(): Promise<InteractionResponse> {
    const ixnContext = this.build()

    return await ixnContext.send()
  }
}
