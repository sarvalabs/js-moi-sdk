import { BN } from "bn.js";
import { encodeToString } from "js-moi-utils";
import { SlotAccessorBuilder, type SlotHash } from "../src/state";

const toSlotHash = (slot: SlotHash): string => {
    return encodeToString(slot.toBuffer('be', 32));
}

// For the below tests, we are using the following object:
// https://github.com/sarvalabs/go-pisa/issues/3

describe("Slot Key Generation", () => {
    test("len(X)", () => {
        const baseSlot = 0
        const slot: SlotHash = new SlotAccessorBuilder(baseSlot).length().generate();

        expect(toSlotHash(slot)).toBe("0x0000000000000000000000000000000000000000000000000000000000000000")
    });


    test(`len(X["foo"])`, () => {
        const base: SlotHash = new BN(0);
        const slot: SlotHash = new SlotAccessorBuilder(base).property("foo").length().generate();

        expect(toSlotHash(slot)).toBe("0xddda8583818ad60e3fb343dead4d2b68e180ab61c90214b29c9f1f8bcbcb8e48")
    })

    test(`len(X["boo"])`, () => {
        const base: SlotHash = new BN(0);
        const slot: SlotHash = new SlotAccessorBuilder(base).property("boo").length().generate();

        expect(toSlotHash(slot)).toBe("0x2b586f4bfc77b974496e6e86c4c8abbc06a8fa56654f3bfcd9fd3dc8db99f1e9")
    })

    test(`X["foo"][0]`, () => {
        const base: SlotHash = new BN(0);
        const slot: SlotHash = new SlotAccessorBuilder(base).property("foo").at(0).generate();

        expect(toSlotHash(slot)).toBe("0xfb70ce47ff2e72a9d69bde31f25e2754335e694164bf9971725742bcdc73bf60");
    });

    test(`X["foo"][1]`, () => {
        const base: SlotHash = new BN(0);
        const slot: SlotHash = new SlotAccessorBuilder(base).property("foo").at(1).generate();

        expect(toSlotHash(slot)).toBe("0xfb70ce47ff2e72a9d69bde31f25e2754335e694164bf9971725742bcdc73bf61");
    });

    test(`X["boo"][1]`, () => {
        const base: SlotHash = new BN(0);
        const slot: SlotHash = new SlotAccessorBuilder(base).property("boo").at(1).generate();

        expect(toSlotHash(slot)).toBe("0xe86598cc5f684a7929ab01bef95109589e3ed0951420336de597876cae07d346");
    });

    test(`Y.a`, () => {
        const base: SlotHash = new BN(1);
        const slot: SlotHash = new SlotAccessorBuilder(base).field("a").generate();

        expect(toSlotHash(slot)).toBe("0x44a2711e9357cdc7c7c8832ad510d1232da569ec2feab44495d2e9ef01ff2bf2");
    }); 

    test(`len(Y.b)`, () => {
        const base: SlotHash = new BN(1);
        const slot: SlotHash = new SlotAccessorBuilder(base).field("b").length().generate();

        expect(toSlotHash(slot)).toBe("0xfbd413697421330767c2ed8b49e142a417588c3db436f5e8a2518fbf8fecaf69");
    });

    test(`len(Y.b[1])`, () => {
        const base: SlotHash = new BN(1);
        const slot: SlotHash = new SlotAccessorBuilder(base).field("b").at(1).length().generate();

        expect(toSlotHash(slot)).toBe("0xfbd413697421330767c2ed8b49e142a417588c3db436f5e8a2518fbf8fecaf69");
    });

    test(`Y.b[1][1]`, () => {
        const base: SlotHash = new BN(1);
        const slot: SlotHash = new SlotAccessorBuilder(base).field("b").at(1).at(1).generate();

        expect(toSlotHash(slot)).toBe("0x760f6627b53e3701958b9c6580ff53cc59f1d126188a0cc90b1e56286b87d82b");
    })

    test('Y.b[0][1]', () => {
        const base: SlotHash = new BN(1);
        const slot: SlotHash = new SlotAccessorBuilder(base).field("b").at(0).at(1).generate();

        expect(toSlotHash(slot)).toBe("0x4f71ce530f6ada3927f1af406779157ffff64d8581a7c94d71e0a136de1c064a");
    });
});