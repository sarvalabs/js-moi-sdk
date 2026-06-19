import { AssetId } from "../src.ts/asset-id";

// 35-byte asset IDs: 1 byte flags + 2 bytes edition + 32 bytes address
const id = (flags: string, edition: string, address: string) =>
    `0x${flags}${edition}${address}`;

const ADDR_ZERO = "00".repeat(32);
const ADDR_PATTERN = "cd".repeat(32);

// Valid IDs (version 0, 35 bytes)
const PLAIN       = id("00", "0000", ADDR_ZERO);      // not stateful, not interactive
const INTERACTIVE = id("01", "0000", ADDR_ZERO);      // bit 0 set → interactive
const STATEFUL    = id("02", "0000", ADDR_ZERO);      // bit 1 set → stateful
const BOTH        = id("03", "0000", ADDR_ZERO);      // bits 0+1 set
const EDITION_7   = id("02", "0007", ADDR_ZERO);      // edition = 7
const EDITION_512 = id("00", "0200", ADDR_ZERO);      // edition = 512
const WITH_ADDR   = id("02", "0000", ADDR_PATTERN);   // non-zero address

// Invalid IDs
const TOO_SHORT   = "0x0000";                          // only 2 bytes
const WRONG_VER   = id("10", "0000", ADDR_ZERO);      // high nibble = 1 → unsupported
const EMPTY       = "0x";                              // empty

describe("AssetId", () => {
    describe("hex() and string()", () => {
        test("hex() returns the id with a 0x prefix", () => {
            const assetId = new AssetId(PLAIN);
            expect(assetId.hex()).toMatch(/^0x[0-9a-f]+$/i);
            expect(assetId.hex()).toBe(PLAIN);
        });

        test("string() returns the id without the 0x prefix", () => {
            const assetId = new AssetId(PLAIN);
            expect(assetId.string()).not.toMatch(/^0x/);
            expect("0x" + assetId.string()).toBe(PLAIN);
        });
    });

    describe("isValid()", () => {
        test("returns true for a correctly sized version-0 asset id", () => {
            expect(new AssetId(PLAIN).isValid()).toBe(true);
        });

        test("returns false for an id that is too short", () => {
            expect(new AssetId(TOO_SHORT).isValid()).toBe(false);
        });

        test("returns false for an id with an unsupported version", () => {
            expect(new AssetId(WRONG_VER).isValid()).toBe(false);
        });

        test("returns false for an empty id", () => {
            expect(new AssetId(EMPTY).isValid()).toBe(false);
        });
    });

    describe("getVersion()", () => {
        test("returns 0 for a valid version-0 asset id", () => {
            expect(new AssetId(PLAIN).getVersion()).toBe(0);
        });

        test("returns -1 for an invalid asset id", () => {
            expect(new AssetId(TOO_SHORT).getVersion()).toBe(-1);
            expect(new AssetId(EMPTY).getVersion()).toBe(-1);
        });
    });

    describe("isStateful()", () => {
        test("returns false when the stateful bit is not set", () => {
            expect(new AssetId(PLAIN).isStateful()).toBe(false);
            expect(new AssetId(INTERACTIVE).isStateful()).toBe(false);
        });

        test("returns true when the stateful bit is set", () => {
            expect(new AssetId(STATEFUL).isStateful()).toBe(true);
            expect(new AssetId(BOTH).isStateful()).toBe(true);
        });

        test("returns false for an invalid asset id", () => {
            expect(new AssetId(TOO_SHORT).isStateful()).toBe(false);
        });
    });

    describe("isInteractive()", () => {
        test("returns false when the interactive bit is not set", () => {
            expect(new AssetId(PLAIN).isInteractive()).toBe(false);
            expect(new AssetId(STATEFUL).isInteractive()).toBe(false);
        });

        test("returns true when the interactive bit is set", () => {
            expect(new AssetId(INTERACTIVE).isInteractive()).toBe(true);
            expect(new AssetId(BOTH).isInteractive()).toBe(true);
        });

        test("returns false for an invalid asset id", () => {
            expect(new AssetId(TOO_SHORT).isInteractive()).toBe(false);
        });
    });

    describe("getEdition()", () => {
        test("returns 0 when the edition bytes are zero", () => {
            expect(new AssetId(PLAIN).getEdition()).toBe(0);
        });

        test("returns the correct edition for edition = 7", () => {
            expect(new AssetId(EDITION_7).getEdition()).toBe(7);
        });

        test("returns the correct edition for edition = 512", () => {
            expect(new AssetId(EDITION_512).getEdition()).toBe(512);
        });

        test("returns 0 for an invalid asset id", () => {
            expect(new AssetId(TOO_SHORT).getEdition()).toBe(0);
        });
    });

    describe("getAddress()", () => {
        test("returns a 64-char hex string (32 bytes) for a valid asset id", () => {
            const addr = new AssetId(PLAIN).getAddress();
            expect(addr).not.toBeNull();
            expect(addr!.length).toBe(64);
        });

        test("returns all-zero hex for an asset id with a zero address", () => {
            expect(new AssetId(PLAIN).getAddress()).toBe("00".repeat(32));
        });

        test("returns the correct address bytes for a patterned asset id", () => {
            expect(new AssetId(WITH_ADDR).getAddress()).toBe(ADDR_PATTERN);
        });

        test("returns null for an invalid asset id", () => {
            expect(new AssetId(TOO_SHORT).getAddress()).toBeNull();
        });
    });
});
