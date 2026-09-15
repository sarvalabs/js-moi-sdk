import { Identifier } from "js-moi-identifiers";
import { Signer } from "js-moi-signer";
import { documentEncode } from "js-polo";
import { MAS0 } from "../src.ts/mas0";
import { MAS0AssetLogic } from "../src.ts/mas0-asset";
import {
    APPROVE_SCHEMA,
    BALANCEOF_SCHEMA,
    BALANCEOF_RESULT_SCHEMA,
    BURN_SCHEMA,
    CIRCULATING_SUPPLY_RESULT_SCHEMA,
    CREATOR_RESULT_SCHEMA,
    DECIMALS_RESULT_SCHEMA,
    GET_DYNAMIC_METADATA_SCHEMA,
    GET_DYNAMIC_METADATA_RESULT_SCHEMA,
    GET_STATIC_METADATA_SCHEMA,
    GET_STATIC_METADATA_RESULT_SCHEMA,
    LOCKUP_SCHEMA,
    MANAGER_RESULT_SCHEMA,
    MAX_SUPPLY_RESULT_SCHEMA,
    MINT_SCHEMA,
    MINT_WITH_METADATA_SCHEMA,
    RELEASE_SCHEMA,
    REVOKE_SCHEMA,
    SET_DYNAMIC_METADATA_SCHEMA,
    SET_STATIC_METADATA_SCHEMA,
    SYMBOL_RESULT_SCHEMA,
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

describe("MAS0 read-only result schemas", () => {
    // Field names and types mirror go-moi's mas0.yaml `returns` block for
    // the matching callsite - these are what a `.call()`'s raw POLO output
    // actually decodes into, not an SDK-side invention.

    test("SYMBOL_RESULT_SCHEMA is a struct with a symbol (string) field", () => {
        expectStruct(SYMBOL_RESULT_SCHEMA);
        expectField(SYMBOL_RESULT_SCHEMA, "symbol", "string");
    });

    test("BALANCEOF_RESULT_SCHEMA is a struct with a balance (integer) field", () => {
        expectStruct(BALANCEOF_RESULT_SCHEMA);
        expectField(BALANCEOF_RESULT_SCHEMA, "balance", "integer");
    });

    test("CREATOR_RESULT_SCHEMA is a struct with a creator (bytes) field", () => {
        expectStruct(CREATOR_RESULT_SCHEMA);
        expectField(CREATOR_RESULT_SCHEMA, "creator", "bytes");
    });

    test("MANAGER_RESULT_SCHEMA is a struct with a manager (bytes) field", () => {
        expectStruct(MANAGER_RESULT_SCHEMA);
        expectField(MANAGER_RESULT_SCHEMA, "manager", "bytes");
    });

    test("DECIMALS_RESULT_SCHEMA is a struct with a decimals (integer) field", () => {
        expectStruct(DECIMALS_RESULT_SCHEMA);
        expectField(DECIMALS_RESULT_SCHEMA, "decimals", "integer");
    });

    test("MAX_SUPPLY_RESULT_SCHEMA is a struct with a max_supply (integer) field", () => {
        expectStruct(MAX_SUPPLY_RESULT_SCHEMA);
        expectField(MAX_SUPPLY_RESULT_SCHEMA, "max_supply", "integer");
    });

    test("CIRCULATING_SUPPLY_RESULT_SCHEMA is a struct with a circulating_supply (integer) field", () => {
        expectStruct(CIRCULATING_SUPPLY_RESULT_SCHEMA);
        expectField(CIRCULATING_SUPPLY_RESULT_SCHEMA, "circulating_supply", "integer");
    });

    test("GET_STATIC_METADATA_RESULT_SCHEMA is a struct with a value (bytes) field", () => {
        expectStruct(GET_STATIC_METADATA_RESULT_SCHEMA);
        expectField(GET_STATIC_METADATA_RESULT_SCHEMA, "value", "bytes");
    });

    test("GET_DYNAMIC_METADATA_RESULT_SCHEMA is a struct with a value (bytes) field", () => {
        expectStruct(GET_DYNAMIC_METADATA_RESULT_SCHEMA);
        expectField(GET_DYNAMIC_METADATA_RESULT_SCHEMA, "value", "bytes");
    });
});

describe("MAS0AssetLogic.decodeResult", () => {
    const SENDER_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
    const ASSET_ID = "0x10030000034baa47d734e845102563dd576e7572d1ab0b6a0d84d6b300000000";

    class TestSigner extends Signer {
        connect(): void {}
        async getKeyId(): Promise<number> {
            return 0;
        }
        async getIdentifier(): Promise<Identifier> {
            return new Identifier(SENDER_ID);
        }
        async sign(): Promise<string> {
            return "0x";
        }
        isInitialized(): boolean {
            return true;
        }
        async signInteraction(): Promise<never> {
            throw new Error("not used in this test");
        }
        async getNonce(): Promise<number> {
            return 0;
        }
        getProvider(): any {
            return {};
        }
    }

    const asset = new MAS0AssetLogic(ASSET_ID, new TestSigner());

    // This exact hex ("0d2f067562616c616e63650303e8") was observed live
    // against a real devnet's BalanceOf response for a balance of 1000
    // (0x3e8) - see /Users/gokul/Documents/payer-spec/full-test/05c-asset-invoke-approval.js.
    // Re-derived here via documentEncode rather than hardcoded, so this test
    // fails if the schema ever stops matching what the node actually sends.
    test("decodes a BalanceOf result into { output: { balance } }", () => {
        const outputs = ("0x" + Buffer.from(documentEncode({ balance: 1000 }, BALANCEOF_RESULT_SCHEMA).bytes()).toString("hex")) as `0x${string}`;

        expect(outputs).toBe("0x0d2f067562616c616e63650303e8");

        const decoded = asset.decodeResult<{ balance: bigint | number }>(MAS0.Endpoint.BALANCEOF, {
            outputs,
            error: "0x",
        });

        expect(decoded.error).toBeNull();
        expect(BigInt(decoded.output.balance)).toBe(1000n);
    });

    test("decodes a GetStaticMetadata result into { output: { value } }", () => {
        const value = new TextEncoder().encode("hello-static");
        const outputs = ("0x" + Buffer.from(documentEncode({ value }, GET_STATIC_METADATA_RESULT_SCHEMA).bytes()).toString("hex")) as `0x${string}`;

        const decoded = asset.decodeResult<{ value: Uint8Array }>(MAS0.Endpoint.GETSTATICMETADATA, {
            outputs,
            error: "0x",
        });

        expect(decoded.error).toBeNull();
        expect(new TextDecoder().decode(decoded.output.value)).toBe("hello-static");
    });

    test("returns a null output for an empty result", () => {
        const decoded = asset.decodeResult(MAS0.Endpoint.SYMBOL, { outputs: "0x", error: "0x" });

        expect(decoded.output).toBeNull();
        expect(decoded.error).toBeNull();
    });

    test("throws for a callsite with no result schema (not read-only)", () => {
        expect(() => asset.decodeResult(MAS0.Endpoint.TRANSFER, { outputs: "0x", error: "0x" })).toThrow(
            /not a read-only MAS0 callsite/,
        );
    });
});
