import { randomBytes } from "crypto";
import { Identifier, IdentifierKind, LogicId } from "../src.ts";
import { hexToBytes } from "../src.ts/utils";

const INVALID_LOGIC_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const VALID_LOGIC_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";

describe(LogicId, () => {
    describe("constructor", () => {
        it.concurrent("should throw error for invalid logic id", () => {
            expect(() => new LogicId(INVALID_LOGIC_ID)).toThrow();
        });

        it.concurrent("should throw error if identifier kind is not logic", () => {
            expect(() => new LogicId(new Identifier(INVALID_LOGIC_ID))).toThrow();
        });

        it.concurrent("should create instance for valid logic id", () => {
            const logicId = new LogicId(VALID_LOGIC_ID);

            expect(logicId).toBeInstanceOf(LogicId);
            expect(logicId.getTag().getKind()).toBe(IdentifierKind.Logic);
            expect(logicId.getFingerprint()).toEqual(hexToBytes(VALID_LOGIC_ID).slice(4, 28));
            expect(logicId.getVariant()).toBe(0);
        });
    });

    describe(LogicId.validate, () => {
        it.concurrent("should return null for valid logic id", () => {
            expect(LogicId.validate(VALID_LOGIC_ID)).toBeNull();
        });

        it.concurrent("should return error for invalid logic id", () => {
            expect(LogicId.validate(INVALID_LOGIC_ID)).not.toBeNull();
        });

        it.concurrent("should return error if the flag is invalid", () => {
            const logicId = hexToBytes(VALID_LOGIC_ID);
            logicId[1] = 0x08;

            expect(LogicId.validate(logicId)).not.toBeNull();
        });
    });

    it.concurrent.each([
        {
            value: new Uint8Array(randomBytes(5)),
            expected: "Invalid identifier length. Expected 32 bytes.",
        },
        {
            value: 5 as any,
        },
        {
            value: "invalid value",
            expected: "Invalid hex string",
        },
        {
            value: null!, // ! is used to make value as any
        },
        {
            value: undefined!, // ! is used to make value as any,
        },
    ])(`should throw an error when value is "$value"`, ({ value, expected }) => {
        expect(() => new LogicId(value)).toThrow(expected);
        expect(LogicId.isValid(value)).toBeFalsy();
    });
});
