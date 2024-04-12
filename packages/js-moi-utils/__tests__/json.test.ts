import { marshal, unmarshal } from "../src.ts/json";

describe("marshal", () => {
  test("should marshal a JSON object to Uint8Array", () => {
    const data = { name: "John", age: 30 };
    const expectedBytes = new TextEncoder().encode(JSON.stringify(data));
    expect(marshal(data)).toEqual(expectedBytes);
  });
});

describe("unmarshal", () => {
  test("should unmarshal Uint8Array to a JSON object", () => {
    const bytes = new TextEncoder().encode('{"name":"John","age":30}');
    const expectedData = { name: "John", age: 30 };
    expect(unmarshal(bytes)).toEqual(expectedData);
  });

  test("should throw an error if there is an error while deserializing", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]); // Invalid UTF-8 bytes
    expect(() => unmarshal(bytes)).toThrow("Error deserializing data:");
  });
});
