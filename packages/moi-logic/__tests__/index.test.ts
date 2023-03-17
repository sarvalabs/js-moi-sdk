import Logic from "../src/index";

describe("Testing Contract", () => {
    test("Constructor", () => {
        const abiInterface = {
            "syntax": "0.1.0",
            "engine": {
              "kind": "PISA",
              "flags": []
            },
            "elements": {
              "0": {
                "kind": "storage",
                "data": {
                  "scope": "persistent",
                  "fields": {
                    "0": {"label": "name", "type": "string"},
                    "1": {"label": "symbol", "type": "string"},
                    "2": {"label": "supply", "type": "uint64"},
                    "3": {"label": "balances", "type": "map[address]uint64"},
                    "4": {"label": "allowances", "type": "map[address]map[address]uint64"}
                  }
                }
              },
              "1": {
                "kind": "builder",
                "deps": [0],
                "data": {
                  "name": "Seeder",
                  "scope": "persistent",
                  "accepts": {
                    "0": {"label": "name", "type": "string"},
                    "1": {"label": "symbol", "type": "string"},
                    "2": {"label": "supply", "type": "uint64"},
                    "3": {"label": "seed", "type": "address"}
                  },
                  "executes": {
                    "bin": [
                      16, 0, 0,
                      20, 0, 0,
                      16, 0, 1,
                      20, 0, 1,
                      16, 0, 2,
                      20, 0, 2,
                      19, 1, 3,
                      16, 2, 3,
                      65, 1, 2, 0,
                      20, 1, 3          ]
                  }
                }
              },
              "2": {
                "kind": "constant",
                "data": {
                  "type": "uint64",
                  "value": "0x10"      }
              },
              "3": {
                "kind": "typedef",
                "data": "map[address]uint64"    },
              "4": {
                "kind": "routine",
                "deps": [0],
                "data": {
                  "name": "Name",
                  "returns": {
                    "0": {"label": "name", "type": "string"}
                  },
                  "executes": {
                    "hex": "0x130000110000"        }
                }
              },
              "5": {
                "kind": "routine",
                "deps": [0],
                "data": {
                  "name": "Symbol",
                  "returns": {
                    "0": {"label": "symbol", "type": "string"}
                  },
                  "executes": {
                    "hex": "0x130001110000"        }
                }
              },
              "6": {
                "kind": "routine",
                "deps": [2],
                "data": {
                  "name": "Decimals",
                  "returns": {
                    "0": {"label": "decimals", "type": "uint64"}
                  },
                  "executes": {
                    "hex": "0x050100000600110000"        }
                }
              },
              "7": {
                "kind": "routine",
                "deps": [0],
                "data": {
                  "name": "TotalSupply",
                  "returns": {
                    "0": {"label": "supply", "type": "uint64"}
                  },
                  "executes": {
                    "hex": "0x130002110000"        }
                }
              },
              "8": {
                "kind": "routine",
                "deps": [0],
                "data": {
                  "name": "BalanceOf",
                  "accepts": {
                    "0": {"label": "addr", "type": "address"}
                  },
                  "returns": {
                    "0": {"label": "balance", "type": "uint64"}
                  },
                  "executes": {
                    "hex": "0x13000310010040020001110200"        }
                }
              },
              "9": {
                "kind": "routine",
                "deps": [0],
                "data": {
                  "name": "Allowance",
                  "accepts": {
                    "0": {"label": "owner", "type": "address"},
                    "1": {"label": "spender", "type": "address"}
                  },
                  "returns": {
                    "0": {"label": "allowance", "type": "uint64"}
                  },
                  "executes": {
                    "hex": "0x1300041001004002000110030140040203110400"        }
                }
              },
              "10": {
                "kind": "routine",
                "deps": [0, 3],
                "data": {
                  "name": "Approve!",
                  "accepts": {
                    "0": {"label": "owner", "type": "address"},
                    "1": {"label": "spender", "type": "address"},
                    "2": {"label": "amount", "type": "uint64"}
                  },
                  "returns": {
                    "0": {"label": "ok", "type": "bool"}
                  },
                  "executes": {
                    "bin": [
                      19, 0, 4,
                      16, 1, 0,
                      64, 2, 0, 1,
                      51, 3, 2,
                      86, 3,
                      5, 1, 4, 10,
                      3, 3, 4,
                      5, 1, 4, 0,
                      7, 4,
                      60, 2, 4,
                      1,
                      16, 3, 1,
                      16, 4, 2,
                      65, 2, 3, 4,
                      65, 0, 1, 2,
                      20, 0, 4,
                      4, 0, 1,
                      86, 0,
                      17, 0, 0          ]
                  }
                }
              },
              "11": {
                "kind": "routine",
                "deps": [0],
                "data": {
                  "name": "Transfer!",
                  "accepts": {
                    "0": {"label": "from", "type": "address"},
                    "1": {"label": "to", "type": "address"},
                    "2": {"label": "amount", "type": "uint64"}
                  },
                  "returns": {
                    "0": {"label": "ok", "type": "bool"}
                  },
                  "executes": {
                    "bin": [
                      19, 0, 3,
                      16, 1, 0,
                      64, 2, 0, 1,
                      16, 3, 2,
                      80, 4, 3, 2,
                      5, 1, 5, 10,
                      3, 4, 5,
                      4, 0, 1,
                      17, 0, 0,
                      0,
                      1,
                      90, 4, 2, 3,
                      65, 0, 1, 4,
                      16, 5, 1,
                      64, 4, 0, 5,
                      89, 6, 4, 3,
                      65, 0, 5, 6,
                      20, 0, 3,
                      4, 0, 1,
                      86, 0,
                      17, 0, 0          ]
                  }
                }
              }
            }
        }

        const logic: any = new Logic(abiInterface)
        logic.setProvider("http://149.102.155.207:1600/")

        const options = {
          builderName: "Seeder",
          arguments: ["MOI", "LOGIC", 500000000, "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084"]
        }

        const promise = logic.deploy(options).send({
            sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
            fuelPrice: "030D40",
            fuelLimit: "030D40"
        })

        return promise.then((result) => {
          console.log("result", result)
        }).catch((err) => {
          console.log(err)
        })
    })
})
