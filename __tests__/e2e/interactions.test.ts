import { JsonRpcProvider } from "js-moi-providers";
import { AssetStandard, CustomError, IxType, hexToBytes, trimHexPrefix } from "js-moi-utils";
import { Wallet } from "js-moi-wallet";

const HOST = "http://localhost:1600";
const MNEMONIC = "visa security tobacco hood forget rate exhibit habit deny good sister slender";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const FUEL_PRICE = 1;
const RECEIVER_ADDRESS = "0x4cdc9a1430ca00cbaaab5dcd858236ba75e64b863d69fa799d31854e103ddf72";
const MANIFEST =
    "0x0e4f065ede01302e312e302f064e504953410fef040e9e04ee079e0bbe149e1ebe299e34fe37be43ae51be5ade69ee73be7dbe8a019ea401aeb1015f0300068e01636f6e7374616e742f0666737472696e67307830363664366636395f0310169e0101636f6e7374616e742f063675363430783033323731305f0310169e0102636f6e7374616e742f06367536343078303330325f0310169e0103636f6e7374616e742f0666737472696e6730783036376136353732366632303631363436343732363537333733323036363666373232303733363536653634363537325f0310169e0104636f6e7374616e742f0666737472696e673078303637613635373236663230363136343634373236353733373332303636366637323230373236353633363536393736363537325f0310169e0105636f6e7374616e742f0666737472696e673078303636393665373337353636363636393633363936353665373432303632363136633631366536333635323036363666373232303733363536653634363537325f0310169e0106636f6e7374616e742f0666737472696e6730783036363936653733373536363636363936333639363536653734323036323631366336313665363336353230363636663732323036323735373236655f031016860107747970656465666d61705b616464726573735d753235364f0310166e0873746174653f06ae0170657273697374656e745f0e8e02fe033f03066673796d626f6c737472696e673f03167601737570706c79753235364f031696010262616c616e6365736d61705b616464726573735d753235365f031e46be01091f0308726f7574696e65af010656de018e069e06a00a53656564216465706c6f7965723f0e8e023f03066673796d626f6c737472696e673f03167601737570706c79753235360f5f06b603b0030400008100000400018100018001027302490202540102008101025f031e46be010a1f0308726f7574696e65af010666fe018e02ae04c00553796d626f6c696e766f6b61626c650f1f0e3f03066673796d626f6c737472696e673f0666608000000500005f031e56ce010b2f030301726f7574696e65bf01069602ae03be03de07b00b446f75626c6552657475726e56616c7565696e766f6b61626c650f3f0e8e023f03066673796d626f6c737472696e673f03167601737570706c797536345f06860380031100001000000500000500001100011000000500010500015f031e46be010c1f0302726f7574696e65bf010686019e02ae02ce04b006446563696d616c73696e766f6b61626c650f1f0e4f03068601646563696d616c737536345f06960190011100021000000500005f031e46be010d1f0308726f7574696e65bf0106b601ce02de02de04f005546f74616c537570706c79696e766f6b61626c650f1f0e3f030666737570706c79753235363f0666608000010500005f031e46be010e1f0308726f7574696e65bf01069601ae02ee04fe06a00942616c616e63654f66696e766f6b61626c651f0e3f03067661646472657373616464726573731f0e3f03067662616c616e6365753235365f06d601d001800002040100530000010500006f031ea6019e020f4f0313233303040508726f7574696e65bf01069601ae029e07ae0790155472616e7366657221696e766f6b61626c653f0ece024f030686017265636569766572616464726573733f03167601616d6f756e74753235360f5f06960d900d7300490000620100620101110209030201110103100101410101040100620201620202110312030302110204100202410201800202530302000404014405030462050511061d03060511050510050541050166030304540200035300020165000004540201008102025f031e46be01101f0308726f7574696e65af010656ee01ee03fe03c0094d696e7421696e766f6b61626c651f0e3f030666616d6f756e74753235360f5f06f604f0047300490000800101040200650101028101018001025302010004030065020203540100028101025f031e66de01112f03130608726f7574696e65af010656ee01ee03fe03d00c4275726e21696e766f6b61626c651f0e3f030666616d6f756e74753235360f5f06860880087300490000800102530201000403004404020362040411050c030504110406100404410401660202035401000281010280000104010066010001240001810001";
const CALLSITE = "Seed!";
const CALLDATA = "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49";

let wallet: Wallet | null = null;

const getFuelLimit = () => 100 + Math.floor(Math.random() * 100);

beforeAll(async () => {
    wallet = await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH);
    wallet.connect(new JsonRpcProvider(HOST));
});

describe("Interactions", () => {
    let assetID: string | undefined;
    let logicID: string | undefined;

    test("wallet should not be null", () => {
        expect(wallet).not.toBeNull();
        return;
    });

    describe("Asset Create", () => {
        test("should create asset", async () => {
            if (wallet == null) {
                // for type safety
                expect(wallet).not.toBeNull();
                return;
            }

            const ix = await wallet.sendInteraction({
                type: IxType.ASSET_CREATE,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                payload: {
                    symbol: "SYMBOL #" + Math.floor(Math.random() * 1000),
                    standard: AssetStandard.MAS0,
                    supply: 100 + Math.floor(Math.random() * 1000),
                },
            });

            const receipt = await ix.wait();
            const result = await ix.result();

            assetID = result.asset_id;

            expect(ix).toBeDefined();
            expect(receipt).toBeDefined();
            expect(result).toBeDefined();
            expect(assetID).toBeDefined();
        });

        test("should able to estimate fuel", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            const fuel = await wallet.estimateFuel({
                type: IxType.ASSET_CREATE,
                fuel_price: FUEL_PRICE,
                fuel_limit: getFuelLimit(),
                payload: {
                    symbol: "SYMBOL #" + Math.floor(Math.random() * 1000),
                    standard: AssetStandard.MAS0,
                    supply: 100 + Math.floor(Math.random() * 1000),
                },
            });

            expect(fuel).toBeDefined();
            expect(fuel).toBeGreaterThan(0);
        }, 10000);
    });

    describe("Value Transfer", () => {
        test("should transfer value", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (assetID == null) {
                expect(assetID).toBeDefined();
                return;
            }

            const ix = await wallet.sendInteraction({
                type: IxType.VALUE_TRANSFER,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                receiver: RECEIVER_ADDRESS,
                transfer_values: new Map([[assetID, 100]]),
            });

            const receipt = await ix.wait();
            const result = await ix.result();

            expect(ix).toBeDefined();
            expect(receipt).toBeDefined();
            expect(result).toBeNull();
        });

        test("should able to estimate fuel", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (assetID == null) {
                expect(assetID).toBeDefined();
                return;
            }

            const fuel = await wallet.estimateFuel({
                type: IxType.VALUE_TRANSFER,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                receiver: RECEIVER_ADDRESS,
                transfer_values: new Map([[trimHexPrefix(assetID), 100]]),
            });

            expect(fuel).toBeDefined();
            expect(fuel).toBeGreaterThan(0);
        });
    });

    describe("Mint Asset", () => {
        test("should mint asset", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (assetID == null) {
                expect(assetID).toBeDefined();
                return;
            }

            const ix = await wallet.sendInteraction({
                type: IxType.ASSET_MINT,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                payload: {
                    asset_id: assetID,
                    amount: Math.floor(Math.random() * 100),
                },
            });

            const receipt = await ix.wait();
            const result = await ix.result();

            expect(ix).toBeDefined();
            expect(receipt).toBeDefined();
            expect(result).toBeDefined();
        });

        test("should able to estimate fuel", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (assetID == null) {
                expect(assetID).toBeDefined();
                return;
            }

            const fuel = await wallet.estimateFuel({
                type: IxType.ASSET_MINT,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                payload: {
                    asset_id: trimHexPrefix(assetID),
                    amount: Math.floor(Math.random() * 100),
                },
            });

            expect(fuel).toBeDefined();
            expect(fuel).toBeGreaterThan(0);
        });
    });

    describe("Burn Asset", () => {
        test("should burn asset", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (assetID == null) {
                expect(assetID).toBeDefined();
                return;
            }

            const ix = await wallet.sendInteraction({
                type: IxType.ASSET_BURN,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                payload: {
                    asset_id: assetID,
                    amount: Math.floor(Math.random() * 100),
                },
            });

            const receipt = await ix.wait();
            const result = await ix.result();

            expect(ix).toBeDefined();
            expect(receipt).toBeDefined();
            expect(result).toBeDefined();
        });

        test("should able to estimate fuel", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (assetID == null) {
                expect(assetID).toBeDefined();
                return;
            }

            const fuel = await wallet.estimateFuel({
                type: IxType.ASSET_BURN,
                fuel_limit: getFuelLimit(),
                fuel_price: FUEL_PRICE,
                payload: {
                    asset_id: trimHexPrefix(assetID),
                    amount: Math.floor(Math.random() * 100),
                },
            });

            expect(fuel).toBeDefined();
            expect(fuel).toBeGreaterThan(0);
        }, 10000);
    });

    describe("Logic Deploy", () => {
        test("should deploy logic", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            const ix = await wallet.sendInteraction({
                type: IxType.LOGIC_DEPLOY,
                fuel_limit: 3000 + Math.floor(Math.random() * 1000),
                fuel_price: FUEL_PRICE,
                payload: {
                    manifest: hexToBytes(MANIFEST),
                    callsite: CALLSITE,
                    calldata: hexToBytes(CALLDATA),
                },
            });

            const receipt = await ix.wait();
            const result = await ix.result();

            logicID = result.logic_id;

            expect(ix).toBeDefined();
            expect(receipt).toBeDefined();
            expect(result).toBeDefined();
        });

        test("should able to estimate fuel", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            const fuel = await wallet.estimateFuel({
                type: IxType.LOGIC_DEPLOY,
                fuel_limit: 3000 + Math.floor(Math.random() * 1000),
                fuel_price: FUEL_PRICE,
                payload: {
                    manifest: hexToBytes(trimHexPrefix(MANIFEST)),
                    callsite: CALLSITE,
                    calldata: hexToBytes(trimHexPrefix(CALLDATA)),
                },
            });

            expect(fuel).toBeDefined();
            expect(fuel).toBeGreaterThan(0);
        });
    });

    describe("Logic Invoke", () => {
        test("should invoke logic", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (logicID == null) {
                expect(logicID).toBeDefined();
                return;
            }

            try {
                const ix = await wallet.sendInteraction({
                    type: IxType.LOGIC_INVOKE,
                    fuel_limit: 3000 + Math.floor(Math.random() * 1000),
                    fuel_price: FUEL_PRICE,
                    payload: {
                        logic_id: logicID,
                        callsite: "Transfer!",
                        calldata: hexToBytes("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49"),
                    },
                });

                const receipt = await ix.wait();

                expect(ix).toBeDefined();
                expect(receipt).toBeDefined();
            } catch (error) {
                expect(error).not.toBeNull();

                if (error instanceof CustomError) {
                    expect(error.reason).toBeDefined();
                }
            }
        });

        test("should able to estimate fuel", async () => {
            if (wallet == null) {
                expect(wallet).not.toBeNull();
                return;
            }

            if (logicID == null) {
                expect(logicID).toBeDefined();
                return;
            }

            try {
                const fuel = await wallet.estimateFuel({
                    type: IxType.LOGIC_INVOKE,
                    fuel_limit: 3000 + Math.floor(Math.random() * 1000),
                    fuel_price: FUEL_PRICE,
                    payload: {
                        logic_id: trimHexPrefix(logicID),
                        callsite: "Transfer!",
                        calldata: hexToBytes(
                            trimHexPrefix("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49")
                        ),
                    },
                });

                expect(fuel).toBeDefined();
                expect(fuel).toBeGreaterThan(0);
            } catch (error) {
                expect(error).not.toBeNull();

                if (error instanceof CustomError) {
                    expect(error.params.receipt).toBeDefined();
                }
            }
        });
    });
});
