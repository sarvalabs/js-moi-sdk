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

    // describe(provider.getTesseract, () => {
    //     it.concurrent("should return tesseract when retrieved using address and height", async () => {
    //         const height = 0;
    //         const tesseract = await provider.getTesseract(ADDRESS, height);

    //         expect(tesseract).toBeDefined();
    //         expect(tesseract.hash).toBeDefined();
    //     });

    //     it.concurrent("should return tesseract when retrieved using address and height", async () => {
    //         const height = -1;
    //         const tesseract = await provider.getTesseract({ identifier: ADDRESS, height });

    //         expect(tesseract).toBeDefined();
    //         expect(tesseract.hash).toBeDefined();
    //     });

    //     it.concurrent("should throw error when tesseract retrieved using address and height where height is less than -1", async () => {
    //         const height = Math.floor(Math.random() * -1000);

    //         await expect(provider.getTesseract(ADDRESS, height)).rejects.toThrow();
    //     });

    //     it.concurrent("should return tesseract when retrieved using absolute reference", async () => {
    //         const tsHash = "0xf283dc52e1ba682e18a7de7d3ffe68111f38eb3cfbf9cbc79477474677e3ca7b";
    //         const tesseract = await provider.getTesseract(tsHash);

    //         expect(tesseract).toBeDefined();
    //         expect(tesseract.hash).toBeDefined();
    //     });
    // });

    // describe(provider.getAccount, () => {
    //     it.concurrent("should return account when retrieved using address", async () => {
    //         const account = await provider.getAccount(ADDRESS);

    //         expect(account).toBeDefined();
    //         expect(account.metadata.address).toEqual(ADDRESS);
    //     });
    // });

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
        it("should return the account when retrieved using address", async () => {
            const account = await provider.getAccount(ADDRESS);

            expect(account).toBeDefined();
            expect(account.metadata.address).toEqual(ADDRESS);
        });

        it("should able to get account using reference", async () => {
            const height = 0;
            const account = await provider.getAccount(ADDRESS, {
                reference: { relative: { height, identifier: ADDRESS } },
                modifier: { include: ["balances", "state"] },
            });

            expect(account).toBeDefined();
            expect(account.metadata.height).toBe(height);
            expect(account.state).toBeDefined();
            expect(account.balances).toBeDefined();
        });

        it("should return the account with included fields", async () => {
            const account = await provider.getAccount(ADDRESS, { modifier: { include: ["balances"] } });

            expect(account).toBeDefined();
            expect(account.balances).toBeDefined();
        });

        it("should return the object with the extracted fields", async () => {
            const account = await provider.getAccount(ADDRESS, { modifier: { extract: "balances" } });

            expect(account).toBeDefined();
            expect(account.balances).toBeDefined();
        });
    });
});
