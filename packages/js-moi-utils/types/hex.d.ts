export type Hex = `0x${string}`;

export type Address = Hex;

export type TrimHexPrefix<T extends Hex> = T extends `0x${infer U}` ? U : never;
