import { Signer } from "js-moi-signer";
import { AssetCreationReceipt, AssetStandard, hexToBN, IxType, toQuantity } from "js-moi-utils";
import { VoyageProvider } from "../lib.cjs";
import { JsonRpcProvider } from "../src.ts/jsonrpc-provider";
import { Filter, InteractionReceipt } from "../types/jsonrpc";
import { getRandomSupply } from "./utils/utils";

const HOST = "http://localhost:1600";
const MNEMONIC = "chest shoe under dice puzzle drive pact amount useless cruise recall chalk";
const ADDRESS = "0x55425876a7bdad21068d629e290b22b564c4f596fdf008db47c037da0cb146db";



describe("Test JsonRpcProvider Query Calls", () => {
  const address = ADDRESS;
    const provider = new JsonRpcProvider(HOST);
    let ixHash: string;
    let signer: Signer;
    let ixReceipt: InteractionReceipt;
    let nextNonce = 0;
    const supply = getRandomSupply();
    MNEMONIC;

    // beforeAll(async() => {
    //   signer = await initializeWallet(provider, MNEMONIC);
    //   const nonce = await signer.getNonce();
    //   const ixResponse = await signer.sendInteraction({
    //     type: IxType.ASSET_CREATE,
    //     nonce: nonce,
    //     fuel_price: 1,
    //     fuel_limit: 200,
    //     payload: {
    //         standard: AssetStandard.MAS0,
    //         symbol: getRandomSymbol(),
    //         supply: supply
    //     }
    //   });

    //   ixHash = ixResponse.hash;
    //   ixReceipt = await ixResponse.wait();
    //   nextNonce = Number(nonce) + 1
    // });

    describe('getBalance', () => {
      it('should return the asset balance', async () => {
        if (!ixReceipt.extra_data) {
          expect(ixReceipt.extra_data).toBeDefined();
          return;
        }

        const balance = await provider.getBalance(address, (<AssetCreationReceipt>ixReceipt.extra_data).asset_id);

        expect(balance).toBe(supply);
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
        const asset = tdu.find(asset => asset.asset_id === extraData.asset_id);

        expect(asset).toBeDefined();
        expect(asset?.amount).toBe(supply);
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

    describe("getInteractionByTesseract", () => {
      it('should return the interaction by tesseract', async () => {
        const interactions = await provider.getInteractionByTesseract(address, undefined, 0);

        expect(interactions).toBeDefined();
        expect(interactions.hash).toBe(ixReceipt.ix_hash);
      });

      it("should return the interaction by tesseract without address", async () => {
        const tesseract = await provider.getTesseract(address, true);
        const interaction = await provider.getInteractionByTesseract({ tesseract_hash: tesseract.hash }, 0);

        expect(interaction).toBeDefined();
        expect(interaction.ts_hash == null).toBeFalsy();
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
          const participant = tesseract.participants.find(p => p.address === address);

          if (!participant) {
            expect(participant).toBeDefined();
            return;
          }
          
          expect(tesseract).toBeDefined();
          expect(hexToBN(participant.height)).toBeGreaterThan(0);
          expect(tesseract.hash == null).toBeFalsy();
        });

        it('should return the tesseract by height', async() => {
          const tesseract = await provider.getTesseract(address, false, {
            tesseract_number: 0
          });

          const participant = tesseract.participants.find(p => p.address === address);

          
          expect(participant).toBeDefined();
          expect(tesseract).toBeDefined();
          expect(participant?.height).toBe(toQuantity(0));
        });

        it('should return the tesseract by hash', async() => {
          const tesseract = await provider.getTesseract(address, false);
          expect(tesseract).toBeDefined();

          const tesseractByHash = await provider.getTesseract(false, {
            tesseract_hash: tesseract.hash
          });

          const participant = tesseractByHash.participants.find(p => p.address === address);

          if (!participant) {
            expect(participant).toBeDefined();
            return;
          }

          expect(tesseractByHash).toBeDefined();
          expect(hexToBN(participant.height)).toBeGreaterThan(0);
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

    describe("getLogs", () => {
      const provider = new VoyageProvider("babylon");
      const address = "0xb90f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce";

      it("should return an result", async () => {
        const logs = await provider.getLogs(address, [5, -1]);
        console.log(logs)
        expect(logs).toBeDefined();
        expect(Array.isArray(logs)).toBeTruthy();
      });

      it("should return an result with topics", async () => {
        const logs = await provider.getLogs(address, [5, 15], [["Transfer"]]);
        expect(logs).toBeDefined();
        expect(Array.isArray(logs)).toBeTruthy();
      });

      it("should throw error if height range is invalid", async () => {
        expect(async () => {
          await provider.getLogs(address, [0, 100])
        }).rejects.toThrow(/Invalid query range/i);
      });
    });
});
