import { AssetActionPayload, InteractionResponse, KeyAddPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { bytesToHex, hexToBytes, LockType, OpType, type Hex } from "js-moi-utils";
import { documentEncode } from "js-polo";
import { InteractionContext } from "js-moi-wallet";

export class ParticipantCreate {
  private _id?: Hex;
  private _keys: KeyAddPayload[] = [];
  private _value?: AssetActionPayload;
  private signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  public id(id: Hex): ParticipantCreate {
    this._id = id;

    return this;
  }

  public addKey(publicKey: Hex, weight: number, signatureAlgorithm = 0): ParticipantCreate {
    this._keys.push({ 
        public_key: publicKey, weight, 
        signature_algorithm: signatureAlgorithm 
    });

    return this;
  }

  public value(assetId: Hex, beneficiary: Hex, amount: number | bigint): ParticipantCreate {
    const transferPayload = {
        beneficiary: hexToBytes(beneficiary),
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

    const calldata = documentEncode(transferPayload, transferSchema)

    this._value = { 
      asset_id: assetId, 
      callsite: "Transfer", 
      calldata: "0x" + bytesToHex(calldata.bytes()) as Hex, 
      // Todo: add funds when required
    };

    return this;
  }

  public build(): InteractionContext<OpType.PARTICIPANT_CREATE> {
    if (this._id == null) throw new Error("participant id is required");
    if (this._value == null) throw new Error("asset payload is required");
    if (this._keys == null || this._keys.length === 0) throw new Error("atleast one key is required");

    return new InteractionContext<OpType.PARTICIPANT_CREATE>({
        opType: OpType.PARTICIPANT_CREATE,
        payload: {
          id: this._id,
          keys_payload: this._keys,
          value: this._value
        },
        participants: [
              {
                id: this._value?.asset_id,
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
