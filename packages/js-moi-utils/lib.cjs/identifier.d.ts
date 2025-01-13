import { type Address, type Hex } from "./hex";
export declare class LogicId {
    readonly value: Hex;
    constructor(value: Hex);
    isPersistent(): boolean;
    isEphemeral(): boolean;
    isIntractable(): boolean;
    isAssetLogic(): boolean;
    getEdition(): number;
    getBytes(): Uint8Array;
    getAddress(): Address;
    toString(): string;
    getVersion(): number;
    static isValid(value: unknown): value is Hex;
}
//# sourceMappingURL=identifier.d.ts.map