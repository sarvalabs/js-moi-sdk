import { hexToBytes } from "js-moi-utils";
import Signature from "../src.ts/signature";

const ECDSA_HEX_SIG =
    "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";

describe("Signature", () => {
    describe("constructor", () => {
        test("defaults all fields to empty when no arguments are provided", () => {
            const sig = new Signature();

            expect(sig.Digest()).toEqual(new Uint8Array());
            expect(sig.Extra()).toEqual(new Uint8Array());
            expect(sig.getName()).toBe("");
        });

        test("stores provided arguments directly", () => {
            const prefix = new Uint8Array([1, 70]);
            const digest = new Uint8Array([0xde, 0xad]);
            const extra = new Uint8Array([0x02]);

            const sig = new Signature(prefix, digest, extra, "ECDSA_S256");

            expect(sig.Digest()).toEqual(digest);
            expect(sig.Extra()).toEqual(extra);
            expect(sig.getName()).toBe("ECDSA_S256");
            expect(sig.getSigByte()).toBe(1);
        });
    });

    describe("unmarshall", () => {
        test("correctly parses a hex string signature", () => {
            const sig = new Signature();
            sig.unmarshall(ECDSA_HEX_SIG);

            expect(sig.getName()).toBe("ECDSA_S256");
            expect(sig.getSigByte()).toBe(1);
            expect(sig.Digest()).toHaveLength(70);
            expect(sig.Extra()).toEqual(new Uint8Array([0x02]));
        });

        test("correctly parses a Uint8Array signature", () => {
            const bytes = hexToBytes(ECDSA_HEX_SIG);
            const sig = new Signature();
            sig.unmarshall(bytes);

            expect(sig.getName()).toBe("ECDSA_S256");
            expect(sig.getSigByte()).toBe(1);
        });

        test("assigns an empty name for an unknown signature index", () => {
            const unknownSig = new Uint8Array([99, 0]);
            const sig = new Signature();
            sig.unmarshall(unknownSig);

            expect(sig.getName()).toBe("");
        });
    });

    describe("getSigByte", () => {
        test("returns the algorithm identifier byte from the prefix", () => {
            const sig = new Signature();
            sig.unmarshall(ECDSA_HEX_SIG);

            expect(sig.getSigByte()).toBe(1);
        });

        test("throws when the signature has not been initialized", () => {
            const sig = new Signature();

            expect(() => sig.getSigByte()).toThrow("Invalid signature byte.");
        });
    });

    describe("serialize", () => {
        test("round-trips correctly: unmarshall then serialize reproduces the original bytes", () => {
            const sig = new Signature();
            sig.unmarshall(ECDSA_HEX_SIG);

            const serialized = sig.serialize();

            expect(Buffer.from(serialized).toString("hex")).toBe(ECDSA_HEX_SIG);
        });

        test("throws when the signature name is empty (not yet initialized)", () => {
            const sig = new Signature();

            expect(() => sig.serialize()).toThrow("Signature is not initialized");
        });
    });

    describe("getName and Digest and Extra", () => {
        test("getName returns the algorithm name after unmarshalling", () => {
            const sig = new Signature();
            sig.unmarshall(ECDSA_HEX_SIG);
            expect(sig.getName()).toBe("ECDSA_S256");
        });

        test("Digest returns the raw DER-encoded signature bytes", () => {
            const sig = new Signature();
            sig.unmarshall(ECDSA_HEX_SIG);
            const digest = sig.Digest();
            expect(digest).toBeInstanceOf(Uint8Array);
            expect(digest.length).toBeGreaterThan(0);
        });

        test("Extra returns the recovery byte appended after the digest", () => {
            const sig = new Signature();
            sig.unmarshall(ECDSA_HEX_SIG);
            expect(sig.Extra()).toEqual(new Uint8Array([0x02]));
        });
    });
});
