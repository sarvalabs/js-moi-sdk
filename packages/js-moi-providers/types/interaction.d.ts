import { TxType } from "js-moi-utils";
import { IxAssetFund, IxParticipant, IxPreferences } from "./jsonrpc";


interface IxTransaction {
    type: TxType;
    payload?: string;
}

export interface ProcessedIxObject {
    nonce: string;

    sender: string;
    payer?: string;

    asset_funds: IxAssetFund[]
    transactions: IxTransaction[]
    participants: IxParticipant[]

    fuel_price: string;
    fuel_limit: string;

    perception?: Uint8Array

    preferences?: IxPreferences
}
