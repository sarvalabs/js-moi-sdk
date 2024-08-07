// import { IxType } from "js-moi-utils";
import { IxType } from "js-moi-utils/src.ts";
import { IxAssetFund, IxParticipant, IxPreferences } from "./jsonrpc";


interface IxStep {
    type: IxType;
    payload?: string;
}

export interface ProcessedIxObject {
    nonce: string;

    sender: string;
    receiver?: string;
    payer?: string;

    asset_funds: IxAssetFund[]
    transactions: IxStep[]
    participants: IxParticipant[]

    fuel_price: string;
    fuel_limit: string;

    perception?: Uint8Array

    preferences?: IxPreferences
}
