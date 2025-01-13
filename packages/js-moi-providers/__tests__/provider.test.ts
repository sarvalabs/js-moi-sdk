import { AssetStandard, hexToBytes, OpType, ReceiptStatus, type Address } from "js-moi-utils";
import { HttpProvider } from "../src.ts";

const ADDRESS: Address = "0x3dedcbbb3bbaedaf75ee57990d899bde242c915b553dcaed873a8b1a1aabbf21";
const HOST = "http://localhost:1600";

describe("Provider", () => {
    const provider = new HttpProvider(HOST, {
        debug: (request) => console.log(JSON.stringify(request)),
    });

    describe(provider.getNetworkInfo, () => {
        it.concurrent("should return the protocol version and chain id", async () => {
            const protocol = await provider.getNetworkInfo();

            expect(protocol).toEqual({ chain_id: expect.any(Number), version: expect.any(String) });
        });
    });

    describe(provider.simulate, () => {
        it.concurrent("should return the simulation result when raw interaction object is passed", async () => {
            const result = await provider.simulate({
                sender: {
                    address: ADDRESS,
                    key_id: 0,
                    sequence_id: 0,
                },
                fuel_price: 1,
                fuel_limit: 100000,
                operations: [
                    {
                        type: OpType.AssetCreate,
                        payload: {
                            symbol: "TST",
                            standard: AssetStandard.MAS0,
                            supply: 1000000,
                        },
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(result.status).toBe(ReceiptStatus.Ok);
            expect(result.hash).toEqual(expect.any(String));
        });

        it.skip("should return the simulation result when POLO encoded interaction is passed", async () => {
            const args = hexToBytes(
                "0x0e9f020ee004e304f304a005ae05fe07800d800d5f06830483043dedcbbb3bbaedaf75ee57990d899bde242c915b553dcaed873a8b1a1aabbf21010186a01f0e2f0316050e7f063363636161605453540f42401f0e5f06830491043dedcbbb3bbaedaf75ee57990d899bde242c915b553dcaed873a8b1a1aabbf2102"
            );

            // This can fail as contains sender address, at moment of testing address may not
            // be created.
            const result = await provider.simulate(args);

            expect(result).toBeDefined();
            expect(result.status).toBe(ReceiptStatus.Ok);
            expect(result.hash).toEqual(expect.any(String));
        });
    });

    describe(provider.getAccount, () => {
        it.concurrent("should return the account when retrieved using address", async () => {
            const account = await provider.getAccount(ADDRESS);

            expect(account).toBeDefined();
            expect(account.metadata.address).toEqual(ADDRESS);
        });

        it.concurrent("should able to get account using reference", async () => {
            const height = 0;
            const account = await provider.getAccount(ADDRESS, {
                reference: { relative: { height, identifier: ADDRESS } },
                modifier: { include: ["balances", "state", "enlisted", "guardians", "keys", "lockups", "mandates"] },
            });

            expect(account).toBeDefined();
            expect(account.metadata.height).toBe(height);
            expect(account.state).toBeDefined();
            expect(account.balances).toBeDefined();
            expect(account.enlisted).toBeDefined();
            expect(account.guardians).toBeDefined();
            expect(account.keys).toBeDefined();
            expect(account.lockups).toBeDefined();
        });

        it.concurrent("should return the account with included fields", async () => {
            const account = await provider.getAccount(ADDRESS, { modifier: { include: ["balances"] } });

            expect(account).toBeDefined();
            expect(account.balances).toBeDefined();
        });

        it.concurrent("should return the object with the extracted fields", async () => {
            const account = await provider.getAccount(ADDRESS, { modifier: { extract: "balances" } });

            expect(account).toBeDefined();
            expect(account.balances).toBeDefined();
        });
    });

    describe(provider.getTesseract, () => {
        it.concurrent("should return the tesseract when retrieved using address and height", async () => {
            const height = 0;
            const tesseract = await provider.getTesseract(ADDRESS, height, {
                modifier: { include: ["confirmations", "consensus", "interactions"] },
            });

            expect(tesseract).toBeDefined();
            expect(tesseract.hash).toBeDefined();
            expect(tesseract.tesseract).toBeDefined();
            expect(tesseract.confirmations).toBeDefined();
            expect(tesseract.consensus).toBeDefined();
            expect(tesseract.interactions).toBeDefined();
        });

        it.concurrent("should return the tesseract when retrieved using tesseract hash", async () => {
            const height = 0;
            const currentTesseract = await provider.getTesseract(ADDRESS, height);
            const tesseract = await provider.getTesseract(currentTesseract.hash);

            expect(tesseract).toBeDefined();
            expect(tesseract.hash).toBeDefined();
            expect(tesseract.hash).toBe(currentTesseract.hash);
        });

        it.concurrent("should return the tesseract when retrieved using tesseract reference", async () => {
            const height = 0;
            const currentTesseract = await provider.getTesseract(ADDRESS, height);
            const tesseract = await provider.getTesseract({ relative: { height, identifier: ADDRESS } });

            expect(tesseract).toBeDefined();
            expect(tesseract.hash).toBeDefined();
            expect(tesseract.hash).toBe(currentTesseract.hash);
        });
    });
});
