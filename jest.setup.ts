import { styleText } from "node:util";
import { HttpProvider, OpType, Wallet } from "./packages/js-moi";

type ProviderType = "http" | "websocket";

//#region Constants
const MNEMONIC: string = "scheme hunt brand slam allow melody detail pledge buddy pair trumpet security";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const PROVIDER_TYPE = "http" as ProviderType;
const LOGIC_ID = "0x0800005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a";
//#endregion

const provider: Record<ProviderType, string> = {
    websocket: "ws://localhost:1600/ws",
    http: "http://localhost:1600",
};

const log = (message: string) => {
    console.log(styleText("cyan", `>> ${new Date().toISOString()} - ${message}`));
};

const createProvider = () => {
    if (!provider[PROVIDER_TYPE]) {
        throw new Error("PROVIDER_URL is not set");
    }

    log(`Creating ${PROVIDER_TYPE} provider with url ${provider[PROVIDER_TYPE]}`);

    return new HttpProvider(provider[PROVIDER_TYPE]);
};

const createWallet = async () => {
    return await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH, {
        provider: createProvider(),
    });
};

const createNewParticipant = async () => {
    log("Creating new participant for testing");

    const wallet = await createWallet();
    const newWallet = await Wallet.createRandom(wallet.getProvider());
    const ix = await wallet.execute({
        type: OpType.ParticipantCreate,
        payload: {
            address: await newWallet.getAddress(),
            amount: 10000000,
            keys_payload: [
                {
                    public_key: newWallet.publicKey,
                    signature_algorithm: 0,
                    weight: 1000,
                },
            ],
        },
    });

    await ix.wait();
    log(`New Participant Created.\nAddress=${await newWallet.getAddress()}`);
    return newWallet;
};

const getAssetId = async (wallet: Wallet) => {
    log("Searching for Asset ID");

    const provider = wallet.getProvider();
    const balances = await provider.getAccount(await wallet.getAddress(), {
        modifier: { extract: "balances" },
    });

    for (const balance of balances) {
        if (balance.asset_id) {
            log(`Asset ID=${balance.asset_id}`);
            return balance.asset_id;
        }
    }

    throw new Error("Asset ID not found");
};

const setup = async () => {
    log(`Starting testing setup`);

    process.env["PROVIDER_TYPE"] = PROVIDER_TYPE;
    process.env["PROVIDER_URL"] = provider[PROVIDER_TYPE];
    process.env["LOGIC_ID"] = LOGIC_ID;

    const wallet = await createNewParticipant();

    process.env["WALLET_PRIVATE_KEY"] = wallet.privateKey;
    process.env["WALLET_CURVE"] = wallet.curve;
    process.env["WALLET_ADDRESS"] = await wallet.getAddress();
    process.env["ASSET_ID"] = await getAssetId(wallet);

    log("Testing setup complete\n");
};

export default setup;
