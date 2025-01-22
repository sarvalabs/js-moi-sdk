import { ManifestCoder } from "js-moi-manifest";
import { HttpProvider, WebsocketProvider, type Provider } from "js-moi-providers";
import { ensureHexPrefix, OpType, type Hex } from "js-moi-utils";
import { CURVE, Wallet } from "../../js-moi-wallet/src.ts";
import { loadManifestFromFile } from "./manifests";

export const getProvider = (): Provider => {
    switch (process.env["PROVIDER_TYPE"]) {
        case "http": {
            if (!process.env["HTTP_PROVIDER_HOST"]) {
                throw new Error("PROVIDER_URL is not set");
            }

            return new HttpProvider(process.env["HTTP_PROVIDER_HOST"]);
        }

        case "ws": {
            if (!process.env["WS_PROVIDER_HOST"]) {
                throw new Error("PROVIDER_URL is not set");
            }

            return new WebsocketProvider(process.env["WS_PROVIDER_HOST"]);
        }

        default: {
            throw new Error(`Unknown provider type: ${process.env["PROVIDER_TYPE"]}`);
        }
    }
};

export const getWallet = () => {
    if (!process.env["TEST_PRIVATE_KEY"]) {
        throw new Error("TEST_PRIVATE_KEY is not set");
    }

    return new Wallet(ensureHexPrefix(process.env["TEST_PRIVATE_KEY"]), CURVE.SECP256K1, getProvider());
};

export const deployLogic = async (wallet: Wallet, name: string, callsite: string, calldata?: Hex) => {
    const manifest = loadManifestFromFile(name);

    const ix = await wallet.execute({
        fuel_price: 1,
        fuel_limit: 10000,
        operations: [
            {
                type: OpType.LogicDeploy,
                payload: { manifest: ManifestCoder.encodeManifest(manifest), callsite, calldata },
            },
        ],
    });

    const results = await ix.result();

    if (results[0].type === OpType.LogicDeploy) {
        return results[0].payload.logic_id;
    }

    throw new Error("Logic deploy failed");
};

export const testIf = (condition: boolean, ...params: Parameters<typeof test>) => (condition ? test : test.skip)(...params);

export const registerNewWallet = async () => {
    try {
        const wallet = getWallet();
        const newWallet = await Wallet.createRandom();

        const ix = await wallet.execute({
            fuel_price: 1,
            fuel_limit: 10000,
            operations: [
                {
                    type: OpType.ParticipantCreate,
                    payload: {
                        address: await newWallet.getAddress(),
                        amount: 50000,
                        keys_payload: [
                            {
                                public_key: newWallet.publicKey,
                                signature_algorithm: 0,
                                weight: 1000,
                            },
                        ],
                    },
                },
            ],
        });

        await ix.wait();
        newWallet.connect(wallet.getProvider());
        return newWallet;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to register new participant");
    }
};
