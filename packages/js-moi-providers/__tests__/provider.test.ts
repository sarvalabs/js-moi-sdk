import {} from "jest";
import type { Address } from "js-moi-utils";
import { JsonRpcProvider } from "../src.ts";

const ADDRESS: Address = "0x3dedcbbb3bbaedaf75ee57990d899bde242c915b553dcaed873a8b1a1aabbf21";
const HOST = "http://localhost:1600";

describe("Provider", () => {
    const provider = new JsonRpcProvider(HOST, {
        debug: (request) => console.log(JSON.stringify(request)),
    });

    describe(provider.getProtocol, () => {
        it.concurrent("should return the protocol version and chain id", async () => {
            const protocol = await provider.getProtocol();

            expect(protocol).toEqual({ chain_id: expect.any(Number), version: expect.any(String) });
        });
    });

    describe(provider.getTesseract, () => {
        it.concurrent("should return tesseract when retrieved using address and height", async () => {
            const height = 0;
            const tesseract = await provider.getTesseract(ADDRESS, height);

            expect(tesseract).toBeDefined();
            expect(tesseract.hash).toBeDefined();
        });

        it.concurrent("should return tesseract when retrieved using address and height", async () => {
            const height = -1;
            const tesseract = await provider.getTesseract({ identifier: ADDRESS, height });

            expect(tesseract).toBeDefined();
            expect(tesseract.hash).toBeDefined();
        });

        it.concurrent("should throw error when tesseract retrieved using address and height where height is less than -1", async () => {
            const height = Math.floor(Math.random() * -1000);

            await expect(provider.getTesseract(ADDRESS, height)).rejects.toThrow();
        });

        it.concurrent("should return tesseract when retrieved using absolute reference", async () => {
            const tsHash = "0xf283dc52e1ba682e18a7de7d3ffe68111f38eb3cfbf9cbc79477474677e3ca7b";
            const tesseract = await provider.getTesseract(tsHash);

            expect(tesseract).toBeDefined();
            expect(tesseract.hash).toBeDefined();
        });
    });

    describe(provider.getAccount, () => {
        it.concurrent("should return account when retrieved using address", async () => {
            const account = await provider.getAccount(ADDRESS);

            expect(account).toBeDefined();
            expect(account.metadata.address).toEqual(ADDRESS);
        });
    });
});
