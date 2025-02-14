import { KramaId, NetworkZone } from "../lib.cjs/index";
import { hexToBytes } from "../lib.cjs/utils";

describe(KramaId, () => {
    const PRIVATE_KEY = "0xa8832f8228ba214ac1656a4a60739508aada64ad88a8a898d93daefafff08f93";

    it.concurrent("should create a Krama ID with the private key", async () => {
        const kramaId = await KramaId.fromPrivateKey(NetworkZone.Zone0, PRIVATE_KEY);

        expect(kramaId).toBeInstanceOf(KramaId);
        expect(kramaId.getMetadata().getZone()).toBe(NetworkZone.Zone0);
        expect(kramaId.getPeerId()).toBe((await KramaId.peerIdFromPrivateKey(hexToBytes(PRIVATE_KEY))).toB58String());
    });
});
