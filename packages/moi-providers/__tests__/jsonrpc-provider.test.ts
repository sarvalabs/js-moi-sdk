import { JsonRpcProvider } from "../src/jsonrpc-provider";
import { InteractionReceipt } from "moi-providers/types/jsonrpc";
import { AssetCreationReceipt, hexToBN } from "moi-utils";

describe("Test JsonRpcProvider Query Calls", () => {
    const address = "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084";
    let provider:JsonRpcProvider;
    let ixHash: string;
    let ixReceipt: InteractionReceipt

    beforeAll(async() => {
      provider = new JsonRpcProvider('http://localhost:1600');
      const ixResponse = await provider.sendInteraction({
        type: 2,
        sender: address,
        fuel_price: "0x130D41",
        fuel_limit: "0x130D41",
        payload: {
          type: 2,
          symbol: "MOI",
          supply: "0x130D41"
        }
      })

      ixHash = ixResponse.hash;
      ixReceipt = await ixResponse.wait(ixHash)
    });

    describe('getBalance', () => {
      it('should return the asset balance', async () => {
        ixReceipt.extra_data = ixReceipt.extra_data as AssetCreationReceipt
        const balance = await provider.getBalance(
          address, 
          ixReceipt.extra_data.asset_id
        );
        expect(balance).toBeDefined();
        expect(balance).toBe(1248577);
      })
    });

    describe('getContextInfo', () => {
      it('should return the latest context info', async () => {
        const contextInfo = await provider.getContextInfo(address);
        expect(contextInfo).toBeDefined();
        expect(contextInfo.behaviour_nodes.length).toBeGreaterThanOrEqual(1);
      });

      it('should return the context info by height', async() => {
        const contextInfo = await provider.getContextInfo(address, {
          tesseract_number: 0
        });
        expect(contextInfo).toBeDefined();
        expect(contextInfo.behaviour_nodes.length).toBeGreaterThanOrEqual(0);
      });


      it('should return the context info by hash', async() => {
        const tesseract = await provider.getTesseract(address, false);
        expect(tesseract).toBeDefined();

        const contextInfo = await provider.getContextInfo(address, {
          tesseract_hash: tesseract.hash
        });
        expect(contextInfo).toBeDefined();
        expect(contextInfo.behaviour_nodes.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe("getTDU", () => {
      it('should return the tdu', async () => {
        ixReceipt.extra_data = ixReceipt.extra_data as AssetCreationReceipt

        const tdu = await provider.getTDU(address);
        expect(tdu).toBeDefined();
        expect(tdu[ixReceipt.extra_data.asset_id]).toBeDefined();
        expect(tdu[ixReceipt.extra_data.asset_id]).toBe(1248577);
      })
    });

    describe("getInteractionCount", () => {
      it('should return the latest interaction count', async () => {
        const ixCount = await provider.getInteractionCount(address);
        expect(ixCount).toBeDefined();
        expect(ixCount).toBeGreaterThanOrEqual(2);
      });

      it('should return the interaction count by height', async() => {
        const ixCount = await provider.getInteractionCount(address, {
          tesseract_number: 0
        });
        expect(ixCount).toBeDefined();
        expect(ixCount).toBe(1);
      });

      it('should return the interaction count by hash', async() => {
        const tesseract = await provider.getTesseract(address, false);
        expect(tesseract).toBeDefined();

        const ixCount = await provider.getInteractionCount(address, {
          tesseract_hash: tesseract.hash
        })
        expect(ixCount).toBeDefined();
        expect(ixCount).toBeGreaterThanOrEqual(2);
      });
    });

    describe("getPendingInteractionCount", () => {
      it("should return the pending interaction count", async() => {
        const ixCount = await provider.getPendingInteractionCount(address);
        expect(ixCount).toBeDefined();
        expect(ixCount).toBeGreaterThanOrEqual(2);
      })
    });

    describe("getAccountState", () => {
      it("should return the latest account state", async() => {
        const accountState = await provider.getAccountState(address);
        expect(accountState).toBeDefined();
        expect(hexToBN(accountState.nonce)).toBeGreaterThanOrEqual(2);
      })

      it("should return the account state by height", async() => {
        const accountState = await provider.getAccountState(address, {
          tesseract_number: 0
        });
        expect(accountState).toBeDefined();
        expect(hexToBN(accountState.nonce)).toBe(1);
      })

      it('should return the account state by hash', async() => {
        const tesseract = await provider.getTesseract(address, false);
        expect(tesseract).toBeDefined();

        const accountState = await provider.getAccountState(address, {
          tesseract_hash: tesseract.hash
        })
        expect(accountState).toBeDefined();
        expect(hexToBN(accountState.nonce)).toBeGreaterThanOrEqual(2);
      });
    });

    describe("getAccountMetaInfo", () => {
      it("should return the account meta info", async() => {
        const accMetaInfo = await provider.getAccountMetaInfo(address);
        expect(accMetaInfo).toBeDefined();
        expect(hexToBN(accMetaInfo.height)).toBeGreaterThanOrEqual(1);
      })
    });

    describe('getTesseract', () => {
        it('should return the latest tesseract', async () => {
          const tesseract = await provider.getTesseract(address, false);
          expect(tesseract).toBeDefined();
          expect(hexToBN(tesseract.header.height)).toBeGreaterThan(0);
        });

        it('should return the tesseract by height', async() => {
          const tesseract = await provider.getTesseract(address, false, {
            tesseract_number: 0
          });
          expect(tesseract).toBeDefined();
          expect(hexToBN(tesseract.header.height)).toBe(0);
        });

        it('should return the tesseract by hash', async() => {
          const tesseract = await provider.getTesseract(address, false);
          expect(tesseract).toBeDefined();

          const tesseractByHash = await provider.getTesseract(address, false, {
            tesseract_hash: tesseract.hash
          })
          expect(tesseractByHash).toBeDefined();
          expect(hexToBN(tesseractByHash.header.height)).toBeGreaterThan(0);
        });
    });

    describe("getContentFrom", () => {
      it('should return the ixpool content for a given address', async () => {
        const content = await provider.getContentFrom(address);
        expect(content).toBeDefined();
        expect(content.pending.size).toBeGreaterThanOrEqual(0);
        expect(content.queued.size).toBeGreaterThanOrEqual(0);
      });
    })

    describe("getContent", () => {
      it('should return the ixpool content', async () => {
        const content = await provider.getContent();
        expect(content).toBeDefined();
        expect(content.pending.size).toBeGreaterThanOrEqual(0);
        expect(content.queued.size).toBeGreaterThanOrEqual(0);
      });
    })

    describe("getStatus", () => {
      it('should return the ixpool status', async () => {
        const status = await provider.getStatus();
        expect(status).toBeDefined();
        expect(status.pending).toBeGreaterThanOrEqual(0);
        expect(status.queued).toBeGreaterThanOrEqual(0);
      });
    });

    describe("getInspect", () => {
      it('should return the ixpool inspection info', async () => {
        const inspectResponse = await provider.getInspect();
        expect(inspectResponse).toBeDefined();
        expect(inspectResponse.pending.size).toBeGreaterThanOrEqual(0);
        expect(inspectResponse.queued.size).toBeGreaterThanOrEqual(0);
        expect(inspectResponse.wait_time.size).toBeGreaterThanOrEqual(0);
      });
    });

    describe("getPeers", () => {
      it('should return the peers list', async () => {
        const peers = await provider.getPeers();
        expect(peers).toBeDefined();
        expect(peers.length).toBeGreaterThanOrEqual(1)
      });
    });

    describe("getAccounts", () => {
      it('should return the accounts', async () => {
        const accounts = await provider.getAccounts();
        expect(accounts).toBeDefined();
        expect(accounts.length).toBeGreaterThanOrEqual(2)
      });
    });
});
