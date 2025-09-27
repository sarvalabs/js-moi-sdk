import { AssetActionPayload, ParticipantCreatePayload, KeyAddPayload } from "js-moi-providers";
import type { Hex } from "js-moi-utils";

export class ParticipantCreate {
  private _id?: Hex;
  private _keys: KeyAddPayload[] = [];
  private _value?: AssetActionPayload;

  id(id: Hex): this {
    this._id = id;

    return this;
  }

  addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): this {
    this._keys.push({ 
        public_key: publicKey, weight, 
        signature_algorithm: signatureAlgorithm 
    });

    return this;
  }

  value(assetId: Hex, callsite: string, funds: Record<Hex, number | bigint>, calldata?: Hex): this {
    this._value = { asset_id: assetId, callsite, funds, calldata };

    return this;
  }

  build(): ParticipantCreatePayload {
    if (this._id == null) throw new Error("participant id is required");
    if (this._value == null) throw new Error("asset payload is required");
    if (this._keys == null || this._keys.length === 0) throw new Error("atleast one key is required");

    return {
      id: this._id,
      keys_payload: this._keys,
      value: this._value
    };
  }
}
