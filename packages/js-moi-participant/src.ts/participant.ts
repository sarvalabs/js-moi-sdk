import { AssetActionPayload, ParticipantCreatePayload, KeyAddPayload, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { LockType, OpType, type Hex } from "js-moi-utils";

export class ParticipantCreate {
  private _id?: Hex;
  private _keys: KeyAddPayload[] = [];
  private _value?: AssetActionPayload;
  private signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  public id(id: Hex): this {
    this._id = id;

    return this;
  }

  public addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): this {
    this._keys.push({ 
        public_key: publicKey, weight, 
        signature_algorithm: signatureAlgorithm 
    });

    return this;
  }

  public value(assetId: Hex, callsite: string, funds: Record<Hex, number | bigint>, calldata?: Hex): this {
    this._value = { asset_id: assetId, callsite, funds, calldata };

    return this;
  }

  public build(): ParticipantCreatePayload {
    if (this._id == null) throw new Error("participant id is required");
    if (this._value == null) throw new Error("asset payload is required");
    if (this._keys == null || this._keys.length === 0) throw new Error("atleast one key is required");

    return {
      id: this._id,
      keys_payload: this._keys,
      value: this._value
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
                  type: OpType.PARTICIPANT_CREATE,
                  payload: payload,
              }
          ],
          participants: [
              {
                id: payload.value?.asset_id,
                lock_type: LockType.NO_LOCK,
              }
          ]
      })
  }
}
