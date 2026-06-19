import { MAS0 } from "../src.ts/mas0";
import {
    APPROVE_SCHEMA,
    BALANCEOF_SCHEMA,
    BURN_SCHEMA,
    GET_DYNAMIC_METADATA_SCHEMA,
    GET_STATIC_METADATA_SCHEMA,
    LOCKUP_SCHEMA,
    MINT_SCHEMA,
    MINT_WITH_METADATA_SCHEMA,
    RELEASE_SCHEMA,
    REVOKE_SCHEMA,
    SET_DYNAMIC_METADATA_SCHEMA,
    SET_STATIC_METADATA_SCHEMA,
    TRANSFER_FROM_SCHEMA,
    TRANSFER_SCHEMA,
} from "../src.ts/mas0-schema";

type PoloSchema = { kind: string; fields?: Record<string, { kind: string }> };

const expectStruct = (schema: PoloSchema) => {
    expect(schema.kind).toBe("struct");
    expect(schema.fields).toBeDefined();
};

const expectField = (schema: PoloSchema, field: string, kind: string) => {
    expect(schema.fields![field]).toBeDefined();
    expect(schema.fields![field].kind).toBe(kind);
};

describe("MAS0 schemas", () => {
    describe("TRANSFER_SCHEMA", () => {
        test("is a struct with beneficiary (bytes) and amount (integer)", () => {
            expectStruct(TRANSFER_SCHEMA);
            expectField(TRANSFER_SCHEMA, "beneficiary", "bytes");
            expectField(TRANSFER_SCHEMA, "amount", "integer");
        });
    });

    describe("TRANSFER_FROM_SCHEMA", () => {
        test("is a struct with benefactor, beneficiary (bytes) and amount (integer)", () => {
            expectStruct(TRANSFER_FROM_SCHEMA);
            expectField(TRANSFER_FROM_SCHEMA, "benefactor", "bytes");
            expectField(TRANSFER_FROM_SCHEMA, "beneficiary", "bytes");
            expectField(TRANSFER_FROM_SCHEMA, "amount", "integer");
        });
    });

    describe("BURN_SCHEMA", () => {
        test("is a struct with only an amount field", () => {
            expectStruct(BURN_SCHEMA);
            expectField(BURN_SCHEMA, "amount", "integer");
            expect(Object.keys(BURN_SCHEMA.fields!)).toHaveLength(1);
        });
    });

    describe("MINT_SCHEMA", () => {
        test("is a struct with beneficiary (bytes) and amount (integer)", () => {
            expectStruct(MINT_SCHEMA);
            expectField(MINT_SCHEMA, "beneficiary", "bytes");
            expectField(MINT_SCHEMA, "amount", "integer");
        });
    });

    describe("MINT_WITH_METADATA_SCHEMA", () => {
        test("is a struct with beneficiary, amount, and static_metadata (map)", () => {
            expectStruct(MINT_WITH_METADATA_SCHEMA);
            expectField(MINT_WITH_METADATA_SCHEMA, "beneficiary", "bytes");
            expectField(MINT_WITH_METADATA_SCHEMA, "amount", "integer");
            expect(MINT_WITH_METADATA_SCHEMA.fields!["static_metadata"].kind).toBe("map");
        });

        test("static_metadata is a map of string → bytes", () => {
            const metadata = MINT_WITH_METADATA_SCHEMA.fields!["static_metadata"] as any;
            expect(metadata.fields.keys.kind).toBe("string");
            expect(metadata.fields.values.kind).toBe("bytes");
        });
    });

    describe("APPROVE_SCHEMA", () => {
        test("is a struct with beneficiary (bytes), amount (integer), and expires_at (integer)", () => {
            expectStruct(APPROVE_SCHEMA);
            expectField(APPROVE_SCHEMA, "beneficiary", "bytes");
            expectField(APPROVE_SCHEMA, "amount", "integer");
            expectField(APPROVE_SCHEMA, "expires_at", "integer");
        });
    });

    describe("LOCKUP_SCHEMA", () => {
        test("is a struct with beneficiary and amount", () => {
            expectStruct(LOCKUP_SCHEMA);
            expectField(LOCKUP_SCHEMA, "beneficiary", "bytes");
            expectField(LOCKUP_SCHEMA, "amount", "integer");
        });
    });

    describe("RELEASE_SCHEMA", () => {
        test("is a struct with benefactor, beneficiary (bytes) and amount (integer)", () => {
            expectStruct(RELEASE_SCHEMA);
            expectField(RELEASE_SCHEMA, "benefactor", "bytes");
            expectField(RELEASE_SCHEMA, "beneficiary", "bytes");
            expectField(RELEASE_SCHEMA, "amount", "integer");
        });
    });

    describe("REVOKE_SCHEMA", () => {
        test("is a struct with only a beneficiary (bytes) field", () => {
            expectStruct(REVOKE_SCHEMA);
            expectField(REVOKE_SCHEMA, "beneficiary", "bytes");
            expect(Object.keys(REVOKE_SCHEMA.fields!)).toHaveLength(1);
        });
    });

    describe("BALANCEOF_SCHEMA", () => {
        test("is a struct with only an address (bytes) field", () => {
            expectStruct(BALANCEOF_SCHEMA);
            expectField(BALANCEOF_SCHEMA, "address", "bytes");
            expect(Object.keys(BALANCEOF_SCHEMA.fields!)).toHaveLength(1);
        });
    });

    describe("SET_STATIC_METADATA_SCHEMA", () => {
        test("is a struct with key and value (string) fields", () => {
            expectStruct(SET_STATIC_METADATA_SCHEMA);
            expectField(SET_STATIC_METADATA_SCHEMA, "key", "string");
            expectField(SET_STATIC_METADATA_SCHEMA, "value", "string");
        });
    });

    describe("SET_DYNAMIC_METADATA_SCHEMA", () => {
        test("is a struct with key and value (string) fields", () => {
            expectStruct(SET_DYNAMIC_METADATA_SCHEMA);
            expectField(SET_DYNAMIC_METADATA_SCHEMA, "key", "string");
            expectField(SET_DYNAMIC_METADATA_SCHEMA, "value", "string");
        });
    });

    describe("GET_STATIC_METADATA_SCHEMA", () => {
        test("is a struct with only a key (string) field", () => {
            expectStruct(GET_STATIC_METADATA_SCHEMA);
            expectField(GET_STATIC_METADATA_SCHEMA, "key", "string");
            expect(Object.keys(GET_STATIC_METADATA_SCHEMA.fields!)).toHaveLength(1);
        });
    });

    describe("GET_DYNAMIC_METADATA_SCHEMA", () => {
        test("is a struct with only a key (string) field", () => {
            expectStruct(GET_DYNAMIC_METADATA_SCHEMA);
            expectField(GET_DYNAMIC_METADATA_SCHEMA, "key", "string");
            expect(Object.keys(GET_DYNAMIC_METADATA_SCHEMA.fields!)).toHaveLength(1);
        });
    });
});

describe("MAS0.Endpoint", () => {
    test("mutable endpoints are correctly defined", () => {
        expect(MAS0.Endpoint.TRANSFER).toBe("Transfer");
        expect(MAS0.Endpoint.TRANSFERFROM).toBe("TransferFrom");
        expect(MAS0.Endpoint.MINT).toBe("Mint");
        expect(MAS0.Endpoint.MINTWITHMETADATA).toBe("MintWithMetadata");
        expect(MAS0.Endpoint.LOCKUP).toBe("Lockup");
        expect(MAS0.Endpoint.BURN).toBe("Burn");
        expect(MAS0.Endpoint.APPROVE).toBe("Approve");
        expect(MAS0.Endpoint.RELEASE).toBe("Release");
        expect(MAS0.Endpoint.REVOKE).toBe("Revoke");
        expect(MAS0.Endpoint.SETSTATICMETADATA).toBe("SetStaticMetadata");
        expect(MAS0.Endpoint.SETDYNAMICMETADATA).toBe("SetDynamicMetadata");
    });

    test("read-only endpoints are correctly defined", () => {
        expect(MAS0.Endpoint.SYMBOL).toBe("Symbol");
        expect(MAS0.Endpoint.BALANCEOF).toBe("BalanceOf");
        expect(MAS0.Endpoint.CREATOR).toBe("Creator");
        expect(MAS0.Endpoint.MANAGER).toBe("Manager");
        expect(MAS0.Endpoint.DECIMALS).toBe("Decimals");
        expect(MAS0.Endpoint.MAXSUPPLY).toBe("MaxSupply");
        expect(MAS0.Endpoint.CIRCULATINGSUPPLY).toBe("CirculatingSupply");
        expect(MAS0.Endpoint.GETSTATICMETADATA).toBe("GetStaticMetadata");
        expect(MAS0.Endpoint.GETDYNAMICMETADATA).toBe("GetDynamicMetadata");
    });

    test("all expected endpoints are present", () => {
        const all = Object.values(MAS0.Endpoint);

        expect(all).toHaveLength(20);
    });
});
