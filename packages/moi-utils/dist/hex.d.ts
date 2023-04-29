import BN from "bn.js";
export declare const numToHex: (value: number | bigint | BN) => string;
export declare const toQuantity: (value: number | bigint | BN) => string;
export declare const encodeToString: (data: Uint8Array) => string;
export declare const hexToBytes: (str: string) => Uint8Array;
export declare const hexToBN: (hex: string) => bigint | number;
export declare const bytesToHex: (data: Uint8Array) => string;
export declare const uint8ToHex: (arr: Uint8Array) => string;
