import { BytesLike, DataOptions } from "../types/bytes";
export type Bytes = ArrayLike<number>;
export interface Hexable {
    toHexString(): string;
}
export declare function isBytes(value: any): value is Bytes;
export declare function hexDataLength(data: BytesLike): number;
export declare function isHexString(value: any, length?: number): boolean;
export declare function hexlify(value: BytesLike | Hexable | number | bigint, options?: DataOptions): string;
