import { LockType } from "js-moi-utils";
import { createRoutineOption, RoutineOption } from "../src.ts/routine-options";

describe("RoutineOption", () => {
    test("creates an instance with all fields undefined when called with no arguments", () => {
        const opt = new RoutineOption();

        expect(opt.sequence).toBeUndefined();
        expect(opt.sender).toBeUndefined();
        expect(opt.fuelLimit).toBeUndefined();
        expect(opt.fuelPrice).toBeUndefined();
        expect(opt.participants).toBeUndefined();
    });

    test("assigns provided numeric fields correctly", () => {
        const opt = new RoutineOption({ sequence: 5, fuelLimit: 1000, fuelPrice: 2 });

        expect(opt.sequence).toBe(5);
        expect(opt.fuelLimit).toBe(1000);
        expect(opt.fuelPrice).toBe(2);
    });

    test("assigns a custom sender object", () => {
        const sender = { id: "0x1234" as `0x${string}`, sequence: 0, key_id: 0 };
        const opt = new RoutineOption({ sender });

        expect(opt.sender).toStrictEqual(sender);
    });

    test("assigns a participants array", () => {
        const participants = [{ id: "0xabcd" as `0x${string}`, lock_type: LockType.NO_LOCK }];
        const opt = new RoutineOption({ participants });

        expect(opt.participants).toStrictEqual(participants);
    });

    test("ignores fields not present in the option object (no extra properties)", () => {
        const opt = new RoutineOption({ fuelLimit: 500 });

        expect(opt.sequence).toBeUndefined();
        expect(opt.fuelLimit).toBe(500);
    });
});

describe("createRoutineOption", () => {
    test("returns a RoutineOption instance", () => {
        const opt = createRoutineOption({ fuelLimit: 200 });

        expect(opt).toBeInstanceOf(RoutineOption);
    });

    test("passes all fields through to the created instance", () => {
        const opt = createRoutineOption({ sequence: 3, fuelLimit: 400, fuelPrice: 1 });

        expect(opt.sequence).toBe(3);
        expect(opt.fuelLimit).toBe(400);
        expect(opt.fuelPrice).toBe(1);
    });

    test("creates an instance with all undefined fields when called with an empty object", () => {
        const opt = createRoutineOption({});

        expect(opt.sequence).toBeUndefined();
        expect(opt.fuelLimit).toBeUndefined();
        expect(opt.fuelPrice).toBeUndefined();
    });
});
