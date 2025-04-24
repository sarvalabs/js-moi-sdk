import { BrowserProvider, InteractionResponse } from "js-moi-providers";
import { AssetStandard, encodeText, isHex, OpType, type InteractionRequest } from "js-moi-utils";
import { BrowserMockTransport } from "../../js-moi-providers/__tests__/mocks/browser-transport";
import { BrowserWallet } from "../src.ts";

const identifier = "0x0000000078648b0296bf21bf050c24695b48d3c8c58a386c4d36bdd500000000";

const wallet = new BrowserWallet(identifier, {
    provider: new BrowserProvider(new BrowserMockTransport()),
});

describe(BrowserWallet, () => {
    it.concurrent("should be able to sign interaction", async () => {
        const message = "Hello World";
        const signature = await wallet.sign(encodeText(message), wallet.signingAlgorithms.ecdsa_secp256k1);

        expect(isHex(signature)).toBeTruthy();
    });

    const request: InteractionRequest = {
        sender: {
            id: "0x00000000dc5eb85d67415c428131dbfef694608a38c8dbb203d1ae1a00000000",
            key_id: 0,
            sequence: 0,
        },
        fuel_limit: 1000000,
        fuel_price: 1,
        operations: [
            {
                type: OpType.AssetCreate,
                payload: { symbol: "TST", supply: 1000000, standard: AssetStandard.MAS0 },
            },
        ],
    };

    it.concurrent("should be able to sign interaction", async () => {
        const signature = await wallet.signInteraction(request, wallet.signingAlgorithms.ecdsa_secp256k1);

        expect(signature).toBeTruthy();
        expect(signature.signatures.length).toBe(1);
        expect(signature.signatures[0].signature).toBeTruthy();
    });

    it.concurrent("should be able to send interaction", async () => {
        const ix = await wallet.execute(request);

        expect(ix).toBeInstanceOf(InteractionResponse);
        expect(isHex(ix.hash)).toBeTruthy();
    });
});
