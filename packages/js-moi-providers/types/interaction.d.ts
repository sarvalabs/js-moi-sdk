import { OpType } from "js-moi-utils";
import { IxAssetFund, IxParticipant, IxPreferences } from "./jsonrpc";


interface IxOperation {
    type: OpType;
    payload?: string;
}

export interface ProcessedIxObject {
    nonce: string;

    sender: string;
    payer?: string;

    funds: IxAssetFund[]
    ix_operations: IxOperation[]
    participants: IxParticipant[]

    fuel_price: string;
    fuel_limit: string;

    perception?: Uint8Array

    preferences?: IxPreferences
}
