import { setFlag } from "../src.ts";

describe(setFlag, () => {
    it.each([[0b00000000, 0, true, 0b00000001]])(`should set the flag`, (value, index, flag, expected) => {
        expect(setFlag(value, index, flag)).toBe(expected);
    });
});
