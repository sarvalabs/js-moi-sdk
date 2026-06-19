import type { LogicManifest } from "../types/manifest";
import { ElementDescriptor } from "../src.ts/element-descriptor";
import { loadManifestFromFile } from "./utils/helper";

describe("ElementDescriptor", () => {
    let manifest: LogicManifest.Manifest;
    let descriptor: ElementDescriptor;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json");
        descriptor = new ElementDescriptor(manifest.elements);
    });

    describe("element registration", () => {
        test("getElements returns all elements keyed by their ptr", () => {
            const elements = descriptor.getElements();
            expect(elements.size).toBe(manifest.elements.length);
            manifest.elements.forEach((el) => {
                expect(elements.has(el.ptr)).toBe(true);
            });
        });

        test("callable elements are registered as call sites", () => {
            const callsites = descriptor.getCallsites();
            const callableNames = manifest.elements
                .filter((el) => el.kind === "callable")
                .map((el) => (el.data as LogicManifest.Routine).name);

            expect(callsites.size).toBe(callableNames.length);
            callableNames.forEach((name) => expect(callsites.has(name)).toBe(true));
        });

        test("event elements are registered in the events map", () => {
            const events = descriptor.getEvents();
            const eventNames = manifest.elements
                .filter((el) => el.kind === "event")
                .map((el) => (el.data as LogicManifest.Event).name);

            expect(events.size).toBe(eventNames.length);
            eventNames.forEach((name) => expect(events.has(name)).toBe(true));
        });

        test("tokenledger has no class or method definitions", () => {
            expect(descriptor.getClassDefs().size).toBe(0);
            expect(descriptor.getMethodDefs().size).toBe(0);
        });
    });

    describe("getStateMatrix", () => {
        test("returns a ContextStateMatrix instance", () => {
            const matrix = descriptor.getStateMatrix();
            expect(matrix).toBeDefined();
        });
    });

    describe("getRoutineElement", () => {
        test("returns the correct element for a known callable name", () => {
            const element = descriptor.getRoutineElement("Seed");
            expect(element).toBeDefined();
            expect(element.kind).toBe("callable");
            expect((element.data as LogicManifest.Routine).name).toBe("Seed");
        });

        test("throws for an unknown routine name", () => {
            expect(() => descriptor.getRoutineElement("NonExistent")).toThrow(
                "Invalid routine name: NonExistent"
            );
        });
    });

    describe("getEventElement", () => {
        test("returns the correct element for a known event name", () => {
            const element = descriptor.getEventElement("Transfer");
            expect(element).toBeDefined();
            expect(element.kind).toBe("event");
            expect((element.data as LogicManifest.Event).name).toBe("Transfer");
        });

        test("throws for an unknown event name", () => {
            expect(() => descriptor.getEventElement("NoSuchEvent")).toThrow(
                "Invalid event name: NoSuchEvent"
            );
        });
    });

    describe("getClassElement", () => {
        test("throws for an unknown class name", () => {
            expect(() => descriptor.getClassElement("NoSuchClass")).toThrow(
                "Invalid routine name: NoSuchClass"
            );
        });
    });

    describe("getMethodElement", () => {
        test("throws for an unknown method name", () => {
            expect(() => descriptor.getMethodElement("NoSuchMethod")).toThrow(
                "Invalid routine name: NoSuchMethod"
            );
        });
    });

    describe("getClassMethods", () => {
        test("throws for an unknown class name", () => {
            expect(() => descriptor.getClassMethods("NoSuchClass")).toThrow(
                "Invalid class name: NoSuchClass"
            );
        });
    });

    describe("with class and method elements", () => {
        let classDescriptor: ElementDescriptor;

        beforeAll(() => {
            const elements: LogicManifest.Element[] = [
                {
                    ptr: 0,
                    kind: "class",
                    data: {
                        name: "Token",
                        fields: [{ slot: 0, label: "value", type: "u64" }],
                        methods: null,
                    } as LogicManifest.Class,
                },
                {
                    ptr: 1,
                    kind: "method",
                    data: {
                        name: "get",
                        class: "class.Token",
                        accepts: [],
                        returns: [{ slot: 0, label: "value", type: "u64" }],
                        executes: { bin: [], hex: "", asm: [] },
                        catches: [],
                    } as unknown as LogicManifest.Method,
                },
            ];

            classDescriptor = new ElementDescriptor(elements);
        });

        test("class element is registered in classDefs with 'class.' prefix", () => {
            expect(classDescriptor.getClassDefs().has("class.Token")).toBe(true);
        });

        test("method element is registered in methodDefs", () => {
            expect(classDescriptor.getMethodDefs().has("get")).toBe(true);
        });

        test("getClassElement returns the correct element", () => {
            const el = classDescriptor.getClassElement("class.Token");
            expect(el.kind).toBe("class");
        });

        test("getMethodElement returns the correct element", () => {
            const el = classDescriptor.getMethodElement("get");
            expect(el.kind).toBe("method");
        });

        test("getClassMethods returns a map of methods for a known class", () => {
            const methods = classDescriptor.getClassMethods("class.Token");
            expect(methods).toBeInstanceOf(Map);
            expect(methods.has("get")).toBe(true);
        });
    });
});
