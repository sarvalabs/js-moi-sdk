import { BaseIdentifier } from "./base-identifier";
import type { Identifier, InvalidReason } from "./types/identifier";
import { type Hex } from "./utils";
export declare class LogicId extends BaseIdentifier {
    constructor(value: Uint8Array | Hex);
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    static isValid(value: Uint8Array | Hex): boolean;
}
/**
 * Generates a new LogicId identifier from the given value.
 *
 * @param value - The value to be used for generating the LogicId. It can be either a Uint8Array or a Hex string.
 * @returns An Identifier instance created from the provided value.
 */
export declare const logicId: (value: Uint8Array | Hex) => Identifier;
/**
 * Checks if the given identifier is an instance of LogicId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of LogicId, otherwise false.
 */
export declare const isLogicId: (value: Identifier) => value is LogicId;
//# sourceMappingURL=logic-id.d.ts.map