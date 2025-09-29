import { KeyAddPayload, KeyRevokePayload, AccountConfigurePayload, AccountInheritPayload, AssetActionPayload, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { bytesToHex, Hex, LockType, OpType } from "js-moi-utils";
import { KMOI_ASSET_ID } from "js-moi-constants";
import { Polorizer } from "js-polo";

export class AccountConfigure {
    private _add: KeyAddPayload[] = [];
    private _revoke: KeyRevokePayload[] = [];
    private signer: Signer;

    constructor(signer: Signer) {
      this.signer = signer;
    }

    addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): AccountConfigure {
      this._add.push({ 
          public_key: publicKey, 
          weight, 
          signature_algorithm: signatureAlgorithm,
      });

      return this;
    }

    revokeKey(keyId: number): AccountConfigure {
      this._revoke.push({ key_id: keyId });
      
      return this;
    }

    build(): AccountConfigurePayload {
      if (
          (this._add == null && this._revoke == null) || 
          (this._add.length === 0 && this._revoke.length === 0)
      ) {
          throw new Error("either add or revoke payload is required") 
      }

      return {
        add: this._add,
        revoke: this._revoke
      };
    }

    public async send(): Promise<InteractionResponse> {
      const payload = this.build()

      return this.signer.sendInteraction({
          sender: {
              id: (await this.signer.getIdentifier()).toHex(),
              sequence: (await this.signer.getNonce()) as number,
              key_id: (await this.signer.getKeyId()),
          },
          fuel_price: 1,
          fuel_limit: 10000,
          ix_operations: [
              {
                  type: OpType.ACCOUNT_CONFIGURE,
                  payload: payload,
              }
          ]
      })
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
        beneficiary: beneficiary,
        amount: amount
    }

    const transferSchema = {
        kind: "struct",
        fields: {
            beneficiary: {
                kind: "bytes"
            },
            amount: {
                kind: "integer"
            }
        }
    }

    const polorizer = new Polorizer()
    polorizer.polorize(transferPayload, transferSchema)

    this._value = { 
      asset_id: assetId, 
      callsite: "Transfer", 
      calldata: "0x" + bytesToHex(polorizer.bytes()) as Hex, 
      // Todo: add funds when required
    };

    return this;
  }

  public index(idx: number): AccountInherit {
    this._index = idx;

    return this;
  }

  public build(): AccountInheritPayload {
    if (this._target == null) throw new Error("target account is required");
    if (this._value == null) throw new Error("asset payload is required");
    if (this._index === undefined) throw new Error("sub account index is required");

    return {
      target_account: this._target,
      value: this._value,
      sub_account_index: this._index
    };
  }

  public async send(): Promise<InteractionResponse> {
    const payload = this.build()

    return this.signer.sendInteraction({
        sender: {
            id: (await this.signer.getIdentifier()).toHex(),
            sequence: (await this.signer.getNonce()) as number,
            key_id: (await this.signer.getKeyId()),
        },
        fuel_price: 1,
        fuel_limit: 10000,
        ix_operations: [
            {
                type: OpType.ACCOUNT_INHERIT,
                payload: payload,
            }
        ],
        participants: [
            {
              id: KMOI_ASSET_ID,
              lock_type: LockType.NO_LOCK,
            }
        ]
    })
  }
}
