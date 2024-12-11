export interface MoiClientInfo {
    /**
     * The networks protocol version
     */
    version: string;
    /**
     * The networks chain ID
     */
    chain_id: number;
}

/**
 * A list of strings indicating the properties to include in the response for provided methods.
 */
export interface IncludesLookup {
    "moi.Tesseract": "consensus" | "interactions" | "confirmations";
}
