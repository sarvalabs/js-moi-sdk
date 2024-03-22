import { encodeToString } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { LogicDriver } from "../src/logic-driver";
import { ArrayIndexAccessor, ClassFieldAccessor, LengthAccessor, PropertyAccessor } from "../src/state";
import { generateStorageKey, StorageKey } from "../src/state/accessor";
import { PROVIDER } from "./utils/constants";
import { loadManifestFromFile } from "./utils/utils";

// For the below tests, we are using the following object:
// https://github.com/sarvalabs/go-pisa/issues/3

describe("Slot Key Generation", () => {
    test("len(X)", () => {
        const baseSlot = generateStorageKey(0);
        const slot = generateStorageKey(baseSlot, new LengthAccessor());

        expect(slot.hex()).toBe("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    test(`len(X["foo"])`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("foo"), new LengthAccessor());

        expect(slot.hex()).toBe("0xddda8583818ad60e3fb343dead4d2b68e180ab61c90214b29c9f1f8bcbcb8e48");
    });

    test(`len(X["boo"])`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("boo"), new LengthAccessor());

        expect(slot.hex()).toBe("0x2b586f4bfc77b974496e6e86c4c8abbc06a8fa56654f3bfcd9fd3dc8db99f1e9");
    });

    test(`X["foo"][0]`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("foo"), new ArrayIndexAccessor(0));
        console.log(slot instanceof StorageKey)
        expect(slot.hex()).toBe("0xfb70ce47ff2e72a9d69bde31f25e2754335e694164bf9971725742bcdc73bf60");
    });

    test(`X["foo"][1]`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("foo"), new ArrayIndexAccessor(1));

        expect(slot.hex()).toBe("0xfb70ce47ff2e72a9d69bde31f25e2754335e694164bf9971725742bcdc73bf61");
    });

    test(`X["boo"][1]`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("boo"), new ArrayIndexAccessor(1));

        expect(slot.hex()).toBe("0xe86598cc5f684a7929ab01bef95109589e3ed0951420336de597876cae07d346");
    });

    test(`Y.a`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(base, new ClassFieldAccessor(1));

        expect(slot.hex()).toBe("0x44a2711e9357cdc7c7c8832ad510d1232da569ec2feab44495d2e9ef01ff2bf2");
    });
    test(`len(Y.b)`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(base, new ClassFieldAccessor(1), new LengthAccessor());

        expect(slot.hex()).toBe("0xfbd413697421330767c2ed8b49e142a417588c3db436f5e8a2518fbf8fecaf69");
    });

    test(`len(Y.b[1])`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(
            base,
            new ClassFieldAccessor(1),
            new ArrayIndexAccessor(1),
            new LengthAccessor()
        );

        expect(slot.hex()).toBe("0xfbd413697421330767c2ed8b49e142a417588c3db436f5e8a2518fbf8fecaf69");
    });

    test(`Y.b[1][1]`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(
            base,
            new ClassFieldAccessor(1),
            new ArrayIndexAccessor(1),
            new ArrayIndexAccessor(1)
        );

        expect(slot.hex()).toBe("0x760f6627b53e3701958b9c6580ff53cc59f1d126188a0cc90b1e56286b87d82b");
    });

    test("Y.b[0][1]", () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(
            base,
            new ClassFieldAccessor(1),
            new ArrayIndexAccessor(0),
            new ArrayIndexAccessor(1)
        );

        expect(slot.hex()).toBe("0x4f71ce530f6ada3927f1af406779157ffff64d8581a7c94d71e0a136de1c064a");
    });
});

describe('Accessing Persistance Storage', () => {
    let logic: LogicDriver;
    
    beforeAll(async () => {
        const manifest = await loadManifestFromFile("../../manifests/atomic_storage.json");
        const logicID = "0x080000eaf5d3321459454f868d4603afa9015cdba0b4a0c2130a11f36b3272f8616cd2";

        logic = new LogicDriver(logicID, manifest, PROVIDER);
    })

    test("it should return the length of the array", async () => {
        const expectedLength = Math.floor(Math.random() * 100);
        
        jest.spyOn(PROVIDER, 'getStorageAt').mockImplementation(() => {
            const polorizer = new Polorizer();
            polorizer.polorizeInteger(expectedLength);
            return Promise.resolve(encodeToString(polorizer.bytes()));
        });

        const length = await logic.persistentState.get<number>(accessor => accessor.entity("value1").length());

        expect(typeof length).toBe("number");
        expect(length).toBe(expectedLength);
    });

    test("it should return the length of the array", async () => {
        const expectedName = "Harsh";
        
        jest.spyOn(PROVIDER, 'getStorageAt').mockImplementation(() => {
            const polorizer = new Polorizer();
            polorizer.polorizeString(expectedName);
            return Promise.resolve(encodeToString(polorizer.bytes()));
        });

        const name = await logic.persistentState.get<string>(accessor => accessor.entity("value2").field("name"));

        expect(typeof name).toBe("string");
        expect(name).toBe(expectedName);
    });

    test("it should be able to access map value", async () => {
        const expectedValue = "Harsh";
        
        jest.spyOn(PROVIDER, 'getStorageAt').mockImplementation(() => {
            const polorizer = new Polorizer();
            polorizer.polorizeString(expectedValue);
            return Promise.resolve(encodeToString(polorizer.bytes()));
        });

        const value = await logic.persistentState.get<string>(accessor => accessor.entity("value3").property("foo").field("name"));

        expect(typeof value).toBe("string");
        expect(value).toBe(expectedValue);
    });


    test("it should throw an error when accessing invalid class field", async () => {
        const expectedValue = "Harsh";
        
        jest.spyOn(PROVIDER, 'getStorageAt').mockImplementation(() => {
            const polorizer = new Polorizer();
            polorizer.polorizeString(expectedValue);
            return Promise.resolve(encodeToString(polorizer.bytes()));
        });

        expect(async () => {
            await logic.persistentState.get<string>(accessor => accessor.entity("value3").property("foo").field("invalid"));
        }).rejects.toThrow();

    });
})