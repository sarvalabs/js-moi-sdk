/// <reference types="node" />
export declare const bytesToHex: (data: Uint8Array) => string;
export declare const hexToBytes: (str: string) => Uint8Array;
export declare function uint8ToHex(arr: Uint8Array): string;
export declare function bytesToUint8(target: Buffer): Uint8Array;
export declare function hexToUint8(hexString: string | Buffer): Uint8Array;
