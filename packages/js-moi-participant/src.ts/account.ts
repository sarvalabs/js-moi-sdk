import { KeyAddPayload, KeyRevokePayload, AccountConfigurePayload, AccountInheritPayload, AssetActionPayload } from "js-moi-providers";
import { Hex } from "js-moi-utils";

export class AccountConfigure {
  private _add: KeyAddPayload[] = [];
  private _revoke: KeyRevokePayload[] = [];

  addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): this {
    this._add.push({ 
        public_key: publicKey, 
        weight, 
        signature_algorithm: signatureAlgorithm,
    });
    return this;
  }

  revokeKey(keyId: number): this {
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
}

export class AccountInherit {
  private _target?: Hex;
  private _value?: AssetActionPayload;
  private _index?: number;

  /** Set the target account to inherit from */
  target(account: Hex): this {
    this._target = account;
    return this;
  }

  /** Set the value payload */
  value(assetId: Hex, callsite: string, funds: Record<Hex, number | bigint>, calldata?: Hex): this {
    this._value = { asset_id: assetId, callsite, funds, calldata };

    return this;
  }

  /** Set the sub-account index */
  index(idx: number): this {
    this._index = idx;

    return this;
  }

  /** Build the final AccountInherit payload */
  build(): AccountInheritPayload {
    if (this._target == null) throw new Error("target account is required");
    if (this._value == null) throw new Error("asset payload is required");
    if (this._index === undefined) throw new Error("sub account index is required");

    return {
      target_account: this._target,
      value: this._value,
      sub_account_index: this._index
    };
  }
}
