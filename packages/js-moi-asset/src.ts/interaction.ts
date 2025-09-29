import { AssetCreatePayload, AssetActionPayload, IxParticipant, InteractionResponse, AnyIxOperation } from "js-moi-providers"
import { Signer } from "js-moi-signer"
import { OpType } from "js-moi-utils"

type AllowedOps = OpType.ASSET_CREATE | OpType.ASSET_INVOKE

type OperationMap = {
  [OpType.ASSET_CREATE]: AssetCreatePayload
  [OpType.ASSET_INVOKE]: AssetActionPayload
}

type Context<T extends AllowedOps> = {
  opType: T
  payload: OperationMap[T]
  participants: IxParticipant[]
  signer: Signer
}

export interface IxOption {
    fuel_price: number;
    fuel_limit: number;
    participants: IxParticipant[];
}

const DEFAULT_FUEL_PRICE = 1
const DEFAULT_FUEL_LIMIT = 10000

export class InteractionContext<T extends AllowedOps> {
  private ctx: Context<T>

  constructor(ctx: Context<T>) {
    this.ctx = ctx
  }

  async send(option?: IxOption): Promise<InteractionResponse> {
    const { opType, payload, participants, signer } = this.ctx

    const ixOp: Extract<AnyIxOperation, { type: T }> = {
      type: opType,
      payload: payload,
    } as Extract<AnyIxOperation, { type: T }>

    return signer.sendInteraction({
      sender: {
        id: (await signer.getIdentifier()).toHex(),
        sequence: (await signer.getNonce()) as number,
        key_id: (await signer.getKeyId()),
      },
      fuel_price: option?.fuel_price != null ? 
      option.fuel_price : DEFAULT_FUEL_PRICE,
      fuel_limit: option?.fuel_limit != null ? 
      option.fuel_limit : DEFAULT_FUEL_LIMIT,
      ix_operations: [ixOp],
      participants : option?.participants ? 
       [ ...option.participants, ...participants ?? []] : participants,
    })
  }

  async call(option?: IxOption): Promise<number|bigint> {
    const { opType, payload, participants, signer } = this.ctx

    const ixOp: Extract<AnyIxOperation, { type: T }> = {
      type: opType,
      payload: payload,
    } as Extract<AnyIxOperation, { type: T }>

    return signer.estimateFuel({
      sender: {
        id: (await signer.getIdentifier()).toHex(),
        sequence: (await signer.getNonce()) as number,
        key_id: (await signer.getKeyId()),
      },
      fuel_price: DEFAULT_FUEL_PRICE,
      fuel_limit: DEFAULT_FUEL_LIMIT,
      ix_operations: [ixOp],
      participants: option?.participants ? 
       [ ...option?.participants, ...participants ?? []] : participants,
    })
  }

  async estimateFuel(option?: IxOption): Promise<number|bigint> {
    const { opType, payload, participants, signer } = this.ctx

    const ixOp: Extract<AnyIxOperation, { type: T }> = {
      type: opType,
      payload: payload,
    } as Extract<AnyIxOperation, { type: T }>

    return signer.estimateFuel({
      sender: {
        id: (await signer.getIdentifier()).toHex(),
        sequence: (await signer.getNonce()) as number,
        key_id: (await signer.getKeyId()),
      },
      fuel_price: DEFAULT_FUEL_PRICE,
      fuel_limit: DEFAULT_FUEL_LIMIT,
      ix_operations: [ixOp],
      participants: option?.participants ? 
       [ ...option?.participants, ...participants ?? []] : participants,
    })
  }
}
