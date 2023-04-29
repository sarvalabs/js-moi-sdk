export type Bytes = ArrayLike<number>;
export declare const isInteger: (value: number) => boolean;
export declare const isBytes: (value: any) => value is Bytes;
export declare const hexDataLength: (data: string) => number;
export declare const isHexString: (value: any, length?: number) => boolean;
export declare const bytesToUint8: (target: Buffer) => Uint8Array;
