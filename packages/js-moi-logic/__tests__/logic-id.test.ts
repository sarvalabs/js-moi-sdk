import { LogicId } from "../src.ts/logic-id";

// 35-byte logic IDs: 1 byte flags + 2 bytes edition + 32 bytes address
const id = (flags: string, edition: string, address: string) =>
    `0x${flags}${edition}${address}`;

const ADDR_ZERO = "00".repeat(32);
const ADDR_PATTERN = "ab".repeat(32);

// Valid IDs (version 0, 35 bytes)
const PLAIN       = id("00", "0000", ADDR_ZERO);      // not stateful, not interactive
const INTERACTIVE = id("01", "0000", ADDR_ZERO);      // bit 0 set → interactive
const STATEFUL    = id("02", "0000", ADDR_ZERO);      // bit 1 set → stateful
const BOTH        = id("03", "0000", ADDR_ZERO);      // bits 0+1 set
const EDITION_5   = id("02", "0005", ADDR_ZERO);      // edition = 5
const EDITION_256 = id("00", "0100", ADDR_ZERO);      // edition = 256
const WITH_ADDR   = id("02", "0000", ADDR_PATTERN);   // non-zero address bytes

// Invalid IDs
const TOO_SHORT   = "0x0000";                          // only 2 bytes
const WRONG_VER   = id("10", "0000", ADDR_ZERO);      // high nibble = 1 → unsupported version
const EMPTY       = "0x";                              // empty

describe("LogicId", () => {
    describe("hex() and string()", () => {
        test("hex() returns the id with a 0x prefix", () => {
            const logicId = new LogicId(PLAIN);
            expect(logicId.hex()).toMatch(/^0x[0-9a-f]+$/i);
            expect(logicId.hex()).toBe(PLAIN);
        });

        test("string() returns the id without the 0x prefix", () => {
            const logicId = new LogicId(PLAIN);
            expect(logicId.string()).not.toMatch(/^0x/);
            expect("0x" + logicId.string()).toBe(PLAIN);
        });
    });

    describe("isValid()", () => {
        test("returns true for a correctly sized version-0 logic id", () => {
            expect(new LogicId(PLAIN).isValid()).toBe(true);
        });

        test("returns false for an id that is too short", () => {
            expect(new LogicId(TOO_SHORT).isValid()).toBe(false);
        });

        test("returns false for an id with an unsupported version", () => {
            expect(new LogicId(WRONG_VER).isValid()).toBe(false);
        });

        test("returns false for an empty id", () => {
            expect(new LogicId(EMPTY).isValid()).toBe(false);
        });
    });

    describe("getVersion()", () => {
        test("returns 0 for a valid version-0 logic id", () => {
            expect(new LogicId(PLAIN).getVersion()).toBe(0);
        });

        test("returns -1 for an invalid logic id", () => {
            expect(new LogicId(TOO_SHORT).getVersion()).toBe(-1);
            expect(new LogicId(EMPTY).getVersion()).toBe(-1);
        });
    });

    describe("isStateful()", () => {
        test("returns false when the stateful bit is not set", () => {
            expect(new LogicId(PLAIN).isStateful()).toBe(false);
            expect(new LogicId(INTERACTIVE).isStateful()).toBe(false);
        });

        test("returns true when the stateful bit is set", () => {
            expect(new LogicId(STATEFUL).isStateful()).toBe(true);
            expect(new LogicId(BOTH).isStateful()).toBe(true);
        });

        test("returns false for an invalid logic id", () => {
            expect(new LogicId(TOO_SHORT).isStateful()).toBe(false);
        });
    });

    describe("isInteractive()", () => {
        test("returns false when the interactive bit is not set", () => {
            expect(new LogicId(PLAIN).isInteractive()).toBe(false);
            expect(new LogicId(STATEFUL).isInteractive()).toBe(false);
        });

        test("returns true when the interactive bit is set", () => {
            expect(new LogicId(INTERACTIVE).isInteractive()).toBe(true);
            expect(new LogicId(BOTH).isInteractive()).toBe(true);
        });

        test("returns false for an invalid logic id", () => {
            expect(new LogicId(TOO_SHORT).isInteractive()).toBe(false);
        });
    });

    describe("getEdition()", () => {
        test("returns 0 when the edition bytes are zero", () => {
            expect(new LogicId(PLAIN).getEdition()).toBe(0);
        });

        test("returns the correct edition for edition = 5", () => {
            expect(new LogicId(EDITION_5).getEdition()).toBe(5);
        });

        test("returns the correct edition for edition = 256", () => {
            expect(new LogicId(EDITION_256).getEdition()).toBe(256);
        });

        test("returns 0 for an invalid logic id", () => {
            expect(new LogicId(TOO_SHORT).getEdition()).toBe(0);
        });
    });

    describe("getAddress()", () => {
        test("returns a 64-char hex string (32 bytes) for a valid logic id", () => {
            const addr = new LogicId(PLAIN).getAddress();
            expect(addr).not.toBeNull();
            expect(addr!.length).toBe(64);
        });

        test("returns all-zero hex for a logic id with a zero address", () => {
            expect(new LogicId(PLAIN).getAddress()).toBe("00".repeat(32));
        });

        test("returns the correct address bytes for a patterned logic id", () => {
            expect(new LogicId(WITH_ADDR).getAddress()).toBe(ADDR_PATTERN);
        });

        test("returns null for an invalid logic id", () => {
            expect(new LogicId(TOO_SHORT).getAddress()).toBeNull();
        });
    });
});
