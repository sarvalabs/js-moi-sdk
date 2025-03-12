import { hexDataLength, isBytes, isInteger } from "../src.ts/bytes";

describe("isInteger", () => {
    it("should return true for integers", () => {
        expect(isInteger(42)).toBe(true);
        expect(isInteger(-10)).toBe(true);
        expect(isInteger(0)).toBe(true);
    });

    it("should return false for non-integers", () => {
        expect(isInteger(3.14)).toBe(false);
        expect(isInteger(NaN)).toBe(false);
    });
});

describe("isBytes", () => {
    it("should return true for valid byte arrays", () => {
        expect(isBytes([0, 255, 128])).toBe(true);
        expect(isBytes(new Uint8Array([1, 2, 3]))).toBe(true);
    });

    it("should return false for invalid byte arrays", () => {
        expect(isBytes(null)).toBe(false);
        expect(isBytes(undefined)).toBe(false);
        expect(isBytes("123")).toBe(false);
        expect(isBytes([-1, 0, 255])).toBe(false);
        expect(isBytes([256, 0, 128])).toBe(false);
    });
});

describe("hexDataLength", () => {
    it("should return the correct length for valid hexadecimal strings", () => {
        expect(hexDataLength("0x")).toBe(0);
        expect(hexDataLength("0x1234")).toBe(2);
        expect(hexDataLength("0xabcdef")).toBe(3);
    });

    it("should return null for invalid hexadecimal strings", () => {
        expect(hexDataLength("123")).toBe(null);
        expect(hexDataLength("0x12345")).toBe(null);
        expect(hexDataLength("0xabcdeff")).toBe(null);
    });
});
