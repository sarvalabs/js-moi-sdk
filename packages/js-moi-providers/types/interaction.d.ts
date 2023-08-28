import { IxType } from "js-moi-utils";

export interface ProcessedIxObject {
    type: IxType;
    nonce: string;

    sender: string;
    receiver?: string;
    payer?: string;

    transfer_values?: Map<string, string>;
    perceived_values?: Map<string, string>;

    fuel_price: string;
    fuel_limit: string;
    
    payload?: string;
}
