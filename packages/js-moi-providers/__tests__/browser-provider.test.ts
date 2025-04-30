import { AssetStandard, bytesToHex, encodeText, isHex, OpType, type Hex, type InteractionRequest } from "js-moi-utils";
import { BrowserProvider, type ExecuteIx } from "../src.ts";
import { BrowserMockTransport } from "./mocks/browser-transport";

describe(BrowserProvider, () => {
    const provider = new BrowserProvider(new BrowserMockTransport());
    it.concurrent("should be able to get version of wallet", async () => {
        expect(await provider.getWalletVersion()).toBe("0.0.1");
    });

    it.concurrent("should be able to get accounts", async () => {
        const accounts = await provider.getWalletAccounts();
        expect(Array.isArray(accounts)).toBe(true);
    });

    it.concurrent("should be able to get network info", async () => {
        const networkInfo = await provider.getNetwork();
        expect(networkInfo).toEqual({
            blockExplorer: expect.any(String),
            chain_id: expect.any(Number),
            id: expect.any(String),
            jsonRpcHost: expect.any(String),
            name: expect.any(String),
        });
    });

    it.concurrent("should be able to get permissions", async () => {
        const permissions = await provider.getPermissions();
        expect(Array.isArray(permissions)).toBe(true);
        expect(permissions.length).toBeGreaterThan(0);
    });

    it.concurrent("should be able to request permissions", async () => {
        const permissions = await provider.requestPermissions("wallet.Accounts", {});

        expect(Array.isArray(permissions)).toBe(true);
        expect(permissions.length).toBeGreaterThan(0);
    });

    it.concurrent("should be able to revoke permissions", async () => {
        const permissions = await provider.revokePermissions("wallet.Accounts", {});

        expect(permissions).toBe(null);
    });

    it.concurrent("should be able to sign interaction", async () => {
        const message = bytesToHex(encodeText("Hello World"));
        const response = await provider.request<Hex>("wallet.SignMessage", [message]);
        const signature = provider.processJsonRpcResponse(response);

        expect(isHex(signature)).toBeTruthy();
    });

    const ix: InteractionRequest = {
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
        const response = await provider.request<ExecuteIx>("wallet.SignInteraction", [ix]);
        const { interaction, signatures } = provider.processJsonRpcResponse(response);

        expect(isHex(interaction)).toBeTruthy();
        expect(Array.isArray(signatures)).toBe(true);
        expect(signatures.length).toBe(1);
    });

    it.concurrent("should be able to sign and send interaction", async () => {
        const response = await provider.request<Hex>("wallet.SendInteraction", [ix]);
        const hash = provider.processJsonRpcResponse(response);

        expect(isHex(hash)).toBeTruthy();
    });
});
