import type { ReceiptStatus } from "../../enums";
import type { Hex } from "../../hex";
export interface NetworkInfo {
    /**
     * The chain ID of the network.
     */
    chain_id: number;
    /**
     * The version of the network.
     */
    version: string;
}
export interface Simulate {
    hash: Hex;
    status: ReceiptStatus;
}
//# sourceMappingURL=responses.d.ts.map