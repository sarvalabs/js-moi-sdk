import { Signer } from "js-moi-signer";
import { AssetCreationReceipt, AssetStandard, hexToBN, IxType } from "js-moi-utils";
import { JsonRpcProvider } from "../src/jsonrpc-provider";
import { Filter, InteractionReceipt } from "../types/jsonrpc";
import { initializeWallet } from "./utils/utils";

describe("Test JsonRpcProvider Query Calls", () => {
    const address =
      "0x2c1fe83b9d6a5c81c5e6d4da20d2d0509ac3c1eb154e5f5b1fc7d5fd4a03b9cc";
    const mnemonic =
      "cushion tissue toss meadow glare math custom because inform describe vacant combine";
    let provider: JsonRpcProvider;
    let ixHash: string;
    let signer: Signer;
    let ixReceipt: InteractionReceipt;
    let nextNonce = 0;

    beforeAll(async() => {
      provider = new JsonRpcProvider('http://localhost:1600');
      signer = await initializeWallet(provider, mnemonic)
      const nonce = await signer.getNonce();
      const ixResponse = await signer.sendInteraction({
        type: IxType.ASSET_CREATE,
        nonce: nonce,
        fuel_price: 1,
        fuel_limit: 200,
        payload: {
            standard: AssetStandard.MAS0,
            symbol: "TESTING",
            supply: 1248577
        }
      })

      ixHash = ixResponse.hash;
      ixReceipt = await ixResponse.wait();
      nextNonce = Number(nonce) + 1
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
        const tdu = await provider.getTDU(address);
        expect(tdu).toBeDefined();
        
        const extraData = ixReceipt.extra_data as AssetCreationReceipt
        const asset = tdu.find(asset => 
          asset.asset_id === extraData.asset_id
        );
        expect(asset).toBeDefined();
        expect(asset?.amount).toBe(1248577);
      })
    });

    describe("getInteractionByHash", () => {
      it("should return the interaction by hash", async () => {
        const ix = await provider.getInteractionByHash(ixHash)
        expect(ix).toBeDefined();
        expect(hexToBN(ix.nonce)).toBeGreaterThanOrEqual(0)
      })
    })

    describe("getInteractionCount", () => {
      it('should return the latest interaction count', async () => {
        const ixCount = await provider.getInteractionCount(address);
        expect(ixCount).toBeDefined();
        expect(ixCount).toBeGreaterThanOrEqual(1);
      });

      it('should return the interaction count by height', async() => {
        const ixCount = await provider.getInteractionCount(address, {
          tesseract_number: 1
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
        expect(ixCount).toBeGreaterThanOrEqual(1);
      });
    });

    describe("getPendingInteractionCount", () => {
      it("should return the pending interaction count", async() => {
        const ixCount = await provider.getPendingInteractionCount(address);
        expect(ixCount).toBeDefined();
        expect(ixCount).toBeGreaterThanOrEqual(1);
      })
    });

    describe("getAccountState", () => {
      it("should return the latest account state", async() => {
        const accountState = await provider.getAccountState(address);
        expect(accountState).toBeDefined();
        expect(hexToBN(accountState.nonce)).toBeGreaterThanOrEqual(1);
      })

      it("should return the account state by height", async() => {
        const accountState = await provider.getAccountState(address, {
          tesseract_number: 1
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
        expect(hexToBN(accountState.nonce)).toBeGreaterThanOrEqual(1);
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

    describe("call", () => {
      it('should return the receipt by executing the interaction', async () => {
        const receipt = await provider.call({
          type: IxType.ASSET_CREATE,
          nonce: nextNonce,
          sender: address,
          fuel_price: 1,
          fuel_limit: 200,
          payload: {
              standard: AssetStandard.MAS0,
              symbol: "CALL",
              supply: 1248577
          }
        })

        expect(receipt).toBeDefined()
      });
    })

    describe("estimateFuel", () => {
      it('should return the estimated fuel by executing the interaction', async () => {
        const fuelPrice = await provider.estimateFuel({
          type: IxType.ASSET_CREATE,
          nonce: nextNonce,
          sender: address,
          fuel_price: 1,
          fuel_limit: 200,
          payload: {
              standard: AssetStandard.MAS0,
              symbol: "ESTIMATE",
              supply: 1248577
          }
        })

        expect(fuelPrice).toBeDefined()
      });
    })

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

    describe("getVersion", () => {
      it('should return the network version', async () => {
        const version = await provider.getVersion();
        expect(version).toBeDefined();
      });
    });

    describe("getNodeInfo", () => {
      it('should return the node info', async () => {
        const nodeInfo = await provider.getNodeInfo();
        expect(nodeInfo).toBeDefined();
      });
    });

    describe("getAccounts", () => {
      it('should return the accounts', async () => {
        const accounts = await provider.getAccounts();
        expect(accounts).toBeDefined();
        expect(accounts.length).toBeGreaterThanOrEqual(2)
      });
    });

    describe("getNewTesseractFilter", () => {
      it("should return the filter object containing the filter id", async () => {
        const filter = await provider.getNewTesseractFilter();

        expect(filter).toBeDefined();
        expect(filter).toHaveProperty("id");
        expect(typeof filter.id).toBe("string");
      });
    });

    describe("getNewTesseractsByAccountFilter", () => {
      it("should return a filter object containing filter id", async () => {
        const filter = await provider.getNewTesseractsByAccountFilter(address);

        expect(filter).toBeDefined();
        expect(filter).toHaveProperty("id");
        expect(typeof filter.id).toBe("string");
      })
    });

    describe("getPendingInteractionFilter", () => {
      it("should return a filter object containing filter id", async () => {
        const filter = await provider.getPendingInteractionFilter();

        expect(filter).toBeDefined();
        expect(filter).toHaveProperty("id");
        expect(typeof filter.id).toBe("string");
      })
    });

    describe("removeFilter", () => {
      it("should a return a object containing status of removal", async () => {
        const filter = await provider.getNewTesseractsByAccountFilter(address);

        const result = await provider.removeFilter(filter);

        expect(result).toBeDefined();
        expect(result).toHaveProperty("status");
        expect(result.status).toBe(true);
      })

      it("should return object with status 'false' for deleted or non-existent filters", async () => {
        const NOT_EXISTING_FILTER_ID = "678384f8-04e4-4984-9d51-44bfa5b185eb"
        const filter: Filter = {
          id: NOT_EXISTING_FILTER_ID
        }

        const result = await provider.removeFilter(filter);
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty("status");
        expect(result.status).toBe(false);
      })
    });

    describe("getFilterChanges", () => {
      it("should return null when no changes made", async () => {
        const filter = await provider.getNewTesseractFilter();
        const result = await provider.getFilterChanges(filter);
        expect(result).toBeNull();
      });

      it("should return an array of terreracts", async () => {
        const nonce = await signer.getNonce();
        const filter = await provider.getNewTesseractFilter();
        const ixResponse = await signer.sendInteraction({
          type: IxType.ASSET_CREATE,
          nonce: nonce,
          fuel_price: 1,
          fuel_limit: 200,
          payload: {
              standard: AssetStandard.MAS0,
              symbol: "TESTING",
              supply: 1248577
          }
        });

        await ixResponse.wait()
        const tesseracts = await provider.getFilterChanges(filter);

        expect(Array.isArray(tesseracts)).toBeTruthy()
        expect(Array.length).toBeGreaterThanOrEqual(1);
      })
    });
    
    describe("getConnections", () => {
      it('should return the connections info', async () => {
        const info = await provider.getConnections();
        expect(info).toBeDefined();
      });
    })
});
