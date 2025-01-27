import { Flag, IdentifierKind, setFlag } from "../src.ts";

describe(Flag, () => {
    describe("constructor", () => {
        it.concurrent.each([
            [IdentifierKind.Participant, 0, 0],
            [IdentifierKind.Asset, 1, 1],
            [IdentifierKind.Logic, 10, 1],
            [IdentifierKind.Logic, 1, 20],
        ])(`should create a flag`, (kind, index, version) => {
            if (index > 7 || version > 15) {
                expect(() => new Flag(kind, index, version)).toThrow();
                return;
            }

            const flag = new Flag(kind, index, version);
            expect(flag).toBeInstanceOf(Flag);
        });
    });
});

describe(setFlag, () => {
    it.concurrent.each([
        [0b00000000, 0, true, 0b00000001],
        [0b00000001, 0, false, 0b00000000],
        [0b00000000, 7, true, 0b10000000],
        [0b10000000, 7, false, 0b00000000],
        [0b10101010, 1, true, 0b10101010],
        [0b10101010, 2, true, 0b10101110],
        [0b10101010, 1, false, 0b10101000],
    ])(`should set the flag`, (value, index, flag, expected) => {
        expect(setFlag(value, index, flag)).toBe(expected);
    });
});
