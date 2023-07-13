export type Bytes = ArrayLike<number>;
export type BytesLike = Bytes | string;
export type DataOptions = {
    allowMissingPrefix?: boolean;
    hexPad?: "left" | "right" | null;
};