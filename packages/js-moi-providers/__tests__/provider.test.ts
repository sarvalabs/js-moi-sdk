import {
    ArrayIndexAccessor,
    AssetId,
    AssetStandard,
    generateStorageKey,
    hexToBytes,
    isHex,
    LogicId,
    OpType,
    ReceiptStatus,
    trimHexPrefix,
    type Address,
    type Hex,
} from "js-moi-utils";
import { HttpProvider, HttpTransport, JsonRpcProvider } from "../src.ts";
import type { LogicMessageRequestOption } from "../src.ts/types/provider.ts";

const ADDRESS: Address = "0x06cae4700aed3168ab5c41cbcd1fe3ad27b1137a3545bc4efc7601b8bc9879f9";
const GUARDIAN_LOGIC_ID: Hex = "0x0800005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a";
const FAUCET_ASSET_ID: Hex = "0x000000004cd973c4eb83cdb8870c0de209736270491b7acc99873da1eddced5826c3b548";
const HOST = "http://localhost:1600";

describe(JsonRpcProvider, () => {
    const provider = new HttpProvider(HOST, {});

    it("should create instance of JsonRpcProvider", () => {
        expect(new JsonRpcProvider(new HttpTransport("http://localhost:1600"))).toBeInstanceOf(JsonRpcProvider);
    });

    describe("Network related tests", () => {
        const it = process.env["RUN_NETWORK_TEST"] === "true" ? globalThis.it : globalThis.it.skip;
        it.concurrent = process.env["RUN_NETWORK_TEST"] === "true" ? globalThis.it.concurrent : globalThis.it.concurrent.skip;

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

            it.concurrent("should return the simulation result when POLO encoded interaction is passed", async () => {
                const args = hexToBytes(
                    "0x0e9f020ee004e304f304a005ae05fe07800d800d5f06830483043dedcbbb3bbaedaf75ee57990d899bde242c915b553dcaed873a8b1a1aabbf21010186a01f0e2f0316050e7f063363636161605453540f42401f0e5f06830491043dedcbbb3bbaedaf75ee57990d899bde242c915b553dcaed873a8b1a1aabbf2102"
                );

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
                    modifier: { include: ["state", "keys", "balances", "mandates", "lockups", "guardians", "enlisted"] },
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
                const balances = await provider.getAccount(ADDRESS, { modifier: { extract: "balances" } });

                expect(balances).toBeDefined();
                expect(Array.isArray(balances)).toBeTruthy();
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

            it.concurrent("should return the tesseract with included fields", async () => {
                const tesseract = await provider.getTesseract(ADDRESS, 0, {
                    modifier: { include: ["confirmations", "consensus", "interactions"] },
                });

                expect(tesseract).toBeDefined();
                expect(tesseract.interactions).toBeDefined();
                expect(tesseract.confirmations).toBeDefined();
                expect(tesseract.consensus).toBeDefined();
                expect(tesseract.interactions).toBeDefined();
            });
        });

        describe(provider.getLogic, () => {
            it.concurrent("should return the logic when retrieved using logic id", async () => {
                const logic = await provider.getLogic(new LogicId(GUARDIAN_LOGIC_ID));

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id.includes(trimHexPrefix(GUARDIAN_LOGIC_ID))).toBeTruthy();
            });

            it.concurrent("should return the logic when retrieved using address", async () => {
                const logic = await provider.getLogic(new LogicId(GUARDIAN_LOGIC_ID).getAddress());

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id.includes(trimHexPrefix(GUARDIAN_LOGIC_ID))).toBeTruthy();
            });

            it.concurrent("should return the logic with reference", async () => {
                const logic = await provider.getLogic(GUARDIAN_LOGIC_ID, {
                    reference: { relative: { identifier: GUARDIAN_LOGIC_ID, height: 0 } },
                });

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id.includes(trimHexPrefix(GUARDIAN_LOGIC_ID))).toBeTruthy();
            });

            it.concurrent("should return the logic with included fields", async () => {
                const logic = await provider.getLogic(GUARDIAN_LOGIC_ID, {
                    modifier: { include: ["manifest", "controller", "edition"] },
                });

                expect(logic).toBeDefined();
                expect(logic.manifest).toBeDefined();
                expect(logic.controller).toBeDefined();
                expect(logic.edition).toBeDefined();
            });

            it.concurrent("should return the logic with extracted fields", async () => {
                const manifest = await provider.getLogic(GUARDIAN_LOGIC_ID, {
                    modifier: { extract: "manifest" },
                });

                expect(manifest).toBeDefined();
                expect(isHex(manifest)).toBeDefined();
            });
        });

        describe(provider.getLogicStorage, () => {
            it.concurrent("should return the logic storage when retrieved using logic id and storage id", async () => {
                const storageId = generateStorageKey(1, new ArrayIndexAccessor(0));
                const value = await provider.getLogicStorage(GUARDIAN_LOGIC_ID, storageId);

                expect(value).toBeDefined();
                expect(isHex(value)).toBeTruthy();
            });

            it.concurrent("should return the logic storage when retrieved using logic id and storage id", async () => {
                const storageId = generateStorageKey(1, new ArrayIndexAccessor(0));
                const value = await provider.getLogicStorage(new LogicId(GUARDIAN_LOGIC_ID), storageId.hex());

                expect(value).toBeDefined();
                expect(isHex(value)).toBeTruthy();
            });

            it.concurrent("should return the logic storage using reference", async () => {
                const storageId = generateStorageKey(1, new ArrayIndexAccessor(0));
                const logicId = new LogicId(GUARDIAN_LOGIC_ID);
                const value = await provider.getLogicStorage(logicId, storageId, {
                    reference: { relative: { identifier: logicId.getAddress(), height: 0 } },
                });

                expect(value).toBeDefined();
                expect(isHex(value)).toBeTruthy();
            });
        });

        describe(provider.getAsset, () => {
            const assetId = new AssetId(FAUCET_ASSET_ID);

            it.concurrent("should return the asset when retrieved using asset address", async () => {
                const asset = await provider.getAsset(assetId.getAddress());

                expect(asset).toBeDefined();
                expect(asset.metadata.asset_id).toBe(FAUCET_ASSET_ID);
                expect(asset.metadata.standard).toBe(assetId.getStandard());
            });

            it.concurrent("should return the asset when retrieved using asset id", async () => {
                const asset = await provider.getAsset(assetId);

                expect(asset).toBeDefined();
                expect(asset.metadata.asset_id).toBe(FAUCET_ASSET_ID);
                expect(asset.metadata.logical).toBe(assetId.isLogical());
            });

            it.concurrent("should return the asset with reference", async () => {
                const asset = await provider.getAsset(assetId, {
                    reference: { relative: { identifier: assetId.getAddress(), height: 0 } },
                });

                expect(asset).toBeDefined();
                expect(asset.metadata.asset_id).toBe(FAUCET_ASSET_ID);
                expect(asset.metadata.supply).toBe(expect.any(String));
            });

            it.concurrent("should return the asset with included fields", async () => {
                const asset = await provider.getAsset(assetId, {
                    modifier: { include: ["controller", "creator", "edition"] },
                });

                expect(asset).toBeDefined();
                expect(asset.metadata).toBeDefined();
                expect(asset.controller).toBeDefined();
                expect(asset.edition).toBeDefined();
            });

            it.concurrent("should return the asset with extracted fields", async () => {
                const controller = await provider.getAsset(assetId, {
                    modifier: { extract: "controller" },
                });

                expect(controller).toBeDefined();
            });

            it.concurrent("should return the asset with modifier and reference", async () => {
                const asset = await provider.getAsset(assetId, {
                    modifier: { include: ["controller", "creator", "edition"] },
                    reference: { relative: { identifier: assetId.getAddress(), height: 0 } },
                });

                expect(asset).toBeDefined();
                expect(asset.metadata).toBeDefined();
                expect(asset.controller).toBeDefined();
                expect(asset.edition).toBeDefined();
            });
        });

        describe(provider.getLogicMessage, () => {
            it.concurrent("should return the logic message when retrieved using logic id", async () => {
                const messages = await provider.getLogicMessage(GUARDIAN_LOGIC_ID);

                expect(messages).toBeDefined();
                expect(Array.isArray(messages)).toBeTruthy();

                const message = messages[0];

                if (message != null) {
                    expect(message.event).toBeDefined();
                    expect(message.source).toBeDefined();
                    expect(message.event.logic_id).toBe(GUARDIAN_LOGIC_ID);
                }
            });

            it.concurrent("should return the logic message when address is passed", async () => {
                const messages = await provider.getLogicMessage(GUARDIAN_LOGIC_ID, {
                    address: new LogicId(GUARDIAN_LOGIC_ID).getAddress(),
                });

                expect(messages).toBeDefined();
                expect(Array.isArray(messages)).toBeTruthy();

                const message = messages[0];

                if (message != null) {
                    expect(message.event).toBeDefined();
                    expect(message.source).toBeDefined();
                    expect(message.event.logic_id).toBe(GUARDIAN_LOGIC_ID);
                }
            });

            it.concurrent.each<LogicMessageRequestOption & { case: string }>([
                {
                    case: "when address is passed",
                    address: ADDRESS,
                },
                {
                    case: "when range is passed",
                    range: { start: 0, stop: 10 },
                },
                {
                    case: "when invalid range is passed",
                    range: { start: -100, stop: 10 },
                },
                {
                    case: "when invalid topics are passed",
                    topics: ["0x01", "0x02"],
                },
                {
                    case: "when topics are passed",
                    topics: ["0x5edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a"],
                },
                {
                    case: "when all options are passed",
                    address: "0x5fc0247c18448e91d15542ffb7a0956b6d5f1a19bdd11a36e6a1f7369288f886",
                    topics: ["0x5edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a"],
                    range: { start: 0, stop: 9 },
                },
            ])("should return the logic message $case", async ({ case: name, ...option }) => {
                const messages = await provider.getLogicMessage(GUARDIAN_LOGIC_ID, option);
                console.log();
                expect(messages).toBeDefined();
                expect(Array.isArray(messages)).toBeTruthy();

                const message = messages[0];

                if (message != null) {
                    expect(message.event).toBeDefined();
                    expect(message.source).toBeDefined();
                    expect(message.event.logic_id).toBe(GUARDIAN_LOGIC_ID);
                }
            });
        });

        describe(provider.getAccountAsset, () => {
            it.concurrent("should return the account asset when retrieved using address and asset id", async () => {
                const accountAsset = await provider.getAccountAsset(ADDRESS, FAUCET_ASSET_ID);

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
            });

            it.concurrent("should return the account asset with reference", async () => {
                const accountAsset = await provider.getAccountAsset(ADDRESS, FAUCET_ASSET_ID, {
                    reference: { relative: { identifier: ADDRESS, height: 0 } },
                });

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
            });

            it.concurrent("should return the account asset with included fields", async () => {
                const accountAsset = await provider.getAccountAsset(ADDRESS, FAUCET_ASSET_ID, {
                    modifier: { include: ["lockup", "mandate"] },
                });

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
                expect(accountAsset.lockup).toBeDefined();
                expect(accountAsset.mandate).toBeDefined();
            });

            it.concurrent("should return the account asset with extracted fields", async () => {
                const lockup = await provider.getAccountAsset(ADDRESS, FAUCET_ASSET_ID, {
                    modifier: { extract: "lockup" },
                });

                expect(lockup).toBeDefined();
            });

            it.concurrent("should return the account asset with modifier and reference", async () => {
                const accountAsset = await provider.getAccountAsset(ADDRESS, FAUCET_ASSET_ID, {
                    modifier: { include: ["lockup", "mandate"] },
                    reference: { relative: { identifier: ADDRESS, height: 0 } },
                });

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
                expect(accountAsset.lockup).toBeDefined();
                expect(accountAsset.mandate).toBeDefined();
            });
        });

        describe(provider.getAccountKey, () => {
            it.concurrent("should return the account key when retrieved using address and key index", async () => {
                const accountKey = await provider.getAccountKey(ADDRESS, 0);

                expect(accountKey).toBeDefined();
                expect(accountKey.key_idx).toBe(0);
                expect(accountKey.public_key).toBeDefined();
                expect(accountKey.weight).toBeDefined();
                expect(accountKey.revoked).toBeDefined();
            });

            it.concurrent("should return the account key with reference", async () => {
                const accountKey = await provider.getAccountKey(ADDRESS, 0, {
                    reference: { relative: { identifier: ADDRESS, height: 0 } },
                });

                expect(accountKey).toBeDefined();
                expect(accountKey.key_idx).toBe(0);
                expect(accountKey.public_key).toBeDefined();
                expect(accountKey.weight).toBeDefined();
                expect(accountKey.revoked).toBeDefined();
            });

            it.concurrent("should return the account key with pending true", async () => {
                const accountKey = await provider.getAccountKey(ADDRESS, 0, { pending: true });

                expect(accountKey).toBeDefined();
                expect(accountKey.key_idx).toBe(0);
                expect(accountKey.public_key).toBeDefined();
                expect(accountKey.weight).toBeDefined();
                expect(accountKey.revoked).toBeDefined();
                expect(accountKey.sequence).toBeDefined();
            });
        });
    });
});
