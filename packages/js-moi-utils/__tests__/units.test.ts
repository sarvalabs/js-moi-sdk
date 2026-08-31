import { formatAmount, formatKmoi, parseAmount, parseKmoi } from "../src.ts/units";
import { UINT256_MAX } from "js-moi-constants";

describe("formatAmount", () => {
    test("formats whole numbers without a decimal point", () => {
        expect(formatAmount(1_000_000_000n, 9)).toBe("1");
        expect(formatAmount(0n, 9)).toBe("0");
    });

    test("formats fractional amounts and trims trailing zeros", () => {
        expect(formatAmount(1_500_000_000n, 9)).toBe("1.5");
        expect(formatAmount(1_000_000_001n, 9)).toBe("1.000000001");
    });

    test("formats with decimals = 0", () => {
        expect(formatAmount(42n, 0)).toBe("42");
    });

    test("formats with decimals = 18", () => {
        expect(formatAmount(1_000_000_000_000_000_000n, 18)).toBe("1");
        expect(formatAmount(1_500_000_000_000_000_000n, 18)).toBe("1.5");
    });

    test("throws for negative values", () => {
        expect(() => formatAmount(-1n, 9)).toThrow("value must be non-negative");
    });

    test("throws when decimals is negative", () => {
        expect(() => formatAmount(1n, -1)).toThrow("decimals must be a non-negative integer");
    });

    test("throws when decimals exceeds MAX_DECIMALS", () => {
        expect(() => formatAmount(1n, 19)).toThrow("decimals must not exceed 18");
    });

    test("throws when decimals is not an integer", () => {
        expect(() => formatAmount(1n, 1.5)).toThrow("decimals must be a non-negative integer");
    });

    test("accepts the maximum uint256 value", () => {
        expect(formatAmount(UINT256_MAX, 0)).toBe(UINT256_MAX.toString());
    });

    test("throws when value overflows uint256", () => {
        expect(() => formatAmount(UINT256_MAX + 1n, 0)).toThrow("value overflows uint256");
    });
});

describe("parseAmount", () => {
    test("parses whole number strings", () => {
        expect(parseAmount("1", 9)).toBe(1_000_000_000n);
        expect(parseAmount("0", 9)).toBe(0n);
    });

    test("parses fractional strings", () => {
        expect(parseAmount("1.5", 9)).toBe(1_500_000_000n);
        expect(parseAmount("1.000000001", 9)).toBe(1_000_000_001n);
    });

    test("roundtrips with formatAmount", () => {
        const values = [0n, 1n, 42n, 1_500_000_000n, 1_000_000_001n];
        for (const value of values) {
            expect(parseAmount(formatAmount(value, 9), 9)).toBe(value);
        }
    });

    test("parses with decimals = 0", () => {
        expect(parseAmount("42", 0)).toBe(42n);
    });

    test("parses with decimals = 18", () => {
        expect(parseAmount("1.5", 18)).toBe(1_500_000_000_000_000_000n);
    });

    test("throws when value has more decimal places than allowed", () => {
        expect(() => parseAmount("1.1234567890", 9)).toThrow("value has more than 9 decimal places");
    });

    test("throws for invalid strings", () => {
        expect(() => parseAmount("-1", 9)).toThrow("value must be a non-negative decimal string");
        expect(() => parseAmount("abc", 9)).toThrow("value must be a non-negative decimal string");
        expect(() => parseAmount("", 9)).toThrow("value must be a non-negative decimal string");
    });

    test("throws when decimals is negative", () => {
        expect(() => parseAmount("1", -1)).toThrow("decimals must be a non-negative integer");
    });

    test("throws when decimals exceeds MAX_DECIMALS", () => {
        expect(() => parseAmount("1", 19)).toThrow("decimals must not exceed 18");
    });

    test("accepts the maximum uint256 value", () => {
        expect(parseAmount(UINT256_MAX.toString(), 0)).toBe(UINT256_MAX);
    });

    test("throws when parsed value overflows uint256", () => {
        expect(() => parseAmount(`${UINT256_MAX + 1n}`, 0)).toThrow("value overflows uint256");
        expect(() => parseAmount("1", 18)).not.toThrow();
        expect(() => parseAmount("9".repeat(80), 18)).toThrow("value overflows uint256");
    });
});

describe("formatKmoi", () => {
    test("formats anu amounts using KMOI_DECIMALS", () => {
        expect(formatKmoi(1_000_000_000n)).toBe("1");
        expect(formatKmoi(1_500_000_000n)).toBe("1.5");
        expect(formatKmoi(5_000_000n)).toBe("0.005");
    });
});

describe("parseKmoi", () => {
    test("parses KMOI strings to anu", () => {
        expect(parseKmoi("1")).toBe(1_000_000_000n);
        expect(parseKmoi("1.5")).toBe(1_500_000_000n);
        expect(parseKmoi("0.005")).toBe(5_000_000n);
    });

    test("roundtrips with formatKmoi", () => {
        const values = [0n, 1_000_000_000n, 1_500_000_000n, 5_000_000n];
        for (const value of values) {
            expect(parseKmoi(formatKmoi(value))).toBe(value);
        }
    });
});
