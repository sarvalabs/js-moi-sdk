// import { JsonRpcProvider } from "../../moi-providers/src";
// import {LogicFactory} from "../src/factory";
// import { Logic } from "../src/logic";

import { LogicId } from "../src/logic_id"

// describe("Testing Contract", () => {
//     test("Constructor", async () => {
//         const abiInterface = {
//           "syntax": "0.1.0",
//           "engine": {
//             "kind": "PISA",
//             "flags": []
//           },
//           "elements": [
//             {
//               "ptr": 0,
//               "kind": "state",
//               "data": {
//                 "kind": "persistent",
//                 "fields": [
//                   {"slot": 0, "label": "name", "type": "string"},
//                   {"slot": 1, "label": "symbol", "type": "string"},
//                   {"slot": 2, "label": "supply", "type": "uint64"},
//                   {"slot": 3, "label": "balances", "type": "map[address]uint64"},
//                   {"slot": 4, "label": "allowances", "type": "map[address]map[address]uint64"}
//                 ]
//               }
//             },
            
//             {
//               "ptr": 1,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Seeder!",
//                 "kind": "deployer",
//                 "accepts": [
//                   {"slot": 0, "label": "name", "type": "string"},
//                   {"slot": 1, "label": "symbol", "type": "string"},
//                   {"slot": 2, "label": "supply", "type": "uint64"},
//                   {"slot": 3, "label": "seeder", "type": "address"}
//                 ],
//                 "executes": {
//                   "bin": [
//                     16, 0, 0,
//                     20, 0, 0,
//                     16, 0, 1,
//                     20, 0, 1,
//                     16, 0, 2,
//                     20, 0, 2,
//                     19, 1, 3,
//                     16, 2, 3,
//                     65, 1, 2, 0,
//                     20, 1, 3
//                   ]
//                 }
//               }
//             },
            
//             {
//               "ptr": 2,
//               "kind": "constant",
//               "data": {
//                 "type": "uint64",
//                 "value": "0x030a"
//               }
//             },
          
//             {
//               "ptr": 3,
//               "kind": "typedef",
//               "data": "map[address]uint64"
//             },
          
//             {
//               "ptr": 4,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Name",
//                 "kind": "invokable",
//                 "returns": [
//                   {"slot": 0, "label": "name", "type": "string"}
//                 ],
//                 "executes": {
//                   "hex": "0x130000110000"
//                 }
//               }
//             },
          
//             {
//               "ptr": 5,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Symbol",
//                 "kind": "invokable",
//                 "returns": [
//                   {"slot": 0, "label": "symbol", "type": "string"}
//                 ],
//                 "executes": {
//                   "hex": "0x130001110000"
//                 }
//               }
//             },
          
//             {
//               "ptr": 6,
//               "kind": "routine",
//               "deps": [2],
//               "data": {
//                 "name": "Decimals",
//                 "kind": "invokable",
//                 "returns": [
//                   {"slot": 0, "label": "decimals", "type": "uint64"}
//                 ],
//                 "executes": {
//                   "hex": "0x050100020600110000"
//                 }
//               }
//             },
          
//             {
//               "ptr": 7,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "TotalSupply",
//                 "kind": "invokable",
//                 "returns": [
//                   {"slot": 0, "label": "supply", "type": "uint64"}
//                 ],
//                 "executes": {
//                   "hex": "0x130002110000"
//                 }
//               }
//             },
          
//             {
//               "ptr": 8,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "BalanceOf",
//                 "kind": "invokable",
//                 "accepts": [
//                   {"slot": 0, "label": "addr", "type": "address"}
//                 ],
//                 "returns": [
//                   {"slot": 0, "label": "balance", "type": "uint64"}
//                 ],
//                 "executes": {
//                   "hex": "0x13000310010040020001110200"
//                 }
//               }
//             },
          
//             {
//               "ptr": 9,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Allowance",
//                 "kind": "invokable",
//                 "accepts": [
//                   {"slot": 0, "label": "owner", "type": "address"},
//                   {"slot": 1, "label": "spender", "type": "address"}
//                 ],
//                 "returns": [
//                   {"slot": 0, "label": "allowance", "type": "uint64"}
//                 ],
//                 "executes": {
//                   "hex": "0x1300041001004002000110030140040203110400"
//                 }
//               }
//             },
          
//             {
//               "ptr": 10,
//               "kind": "routine",
//               "deps": [0, 3],
//               "data": {
//                 "name": "Approve!",
//                 "kind": "invokable",
//                 "accepts": [
//                   {"slot": 0, "label": "owner", "type": "address"},
//                   {"slot": 1, "label": "spender", "type": "address"},
//                   {"slot": 2, "label": "amount", "type": "uint64"}
//                 ],
//                 "returns": [
//                   {"slot": 0, "label": "ok", "type": "bool"}
//                 ],
//                 "executes": {
//                   "bin": [
//                     19, 0, 4,
//                     16, 1, 0,
//                     64, 2, 0, 1,
//                     51, 3, 2,
//                     86, 3,
//                     5, 1, 4, 10,
//                     3, 3, 4,
//                     5, 1, 4, 0,
//                     7, 4,
//                     60, 2, 4,
//                     1,
//                     16, 3, 1,
//                     16, 4, 2,
//                     65, 2, 3, 4,
//                     65, 0, 1, 2,
//                     20, 0, 4,
//                     4, 0, 1,
//                     86, 0,
//                     17, 0, 0
//                   ]
//                 }
//               }
//             },
          
//             {
//               "ptr": 11,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Transfer!",
//                 "kind": "invokable",
//                 "accepts": [
//                   {"slot": 0, "label": "from", "type": "address"},
//                   {"slot": 1, "label": "to", "type": "address"},
//                   {"slot": 2, "label": "amount", "type": "uint64"}
//                 ],
//                 "returns": [
//                   {"slot": 0, "label": "ok", "type": "bool"}
//                 ],
//                 "executes": {
//                   "bin": [
//                     19, 0, 3,
//                     16, 1, 0,
//                     64, 2, 0, 1,
//                     16, 3, 2,
//                     80, 4, 3, 2,
//                     5, 1, 5, 10,
//                     3, 4, 5,
//                     4, 0, 1,
//                     17, 0, 0,
//                     0,
//                     1,
//                     90, 4, 2, 3,
//                     65, 0, 1, 4,
//                     16, 5, 1,
//                     64, 4, 0, 5,
//                     89, 6, 4, 3,
//                     65, 0, 5, 6,
//                     20, 0, 3,
//                     4, 0, 1,
//                     86, 0,
//                     17, 0, 0
//                   ]
//                 }
//               }
//             },
          
//             {
//               "ptr": 12,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Mint!",
//                 "kind": "invokable",
//                 "accepts": [
//                   {"slot": 0, "label": "amount", "type": "uint64"},
//                   {"slot": 1, "label": "addr", "type": "address"}
//                 ],
//                 "returns": [
//                   {"slot": 0, "label": "ok", "type": "bool"}
//                 ],
//                 "executes": {
//                   "hex": "0x130002100100590000011400021300031002014003000259030301410002031400030400015600110000"
//                 }
//               }
//             },
          
//             {
//               "ptr": 13,
//               "kind": "routine",
//               "deps": [0],
//               "data": {
//                 "name": "Burn!",
//                 "kind": "invokable",
//                 "accepts": [
//                   {"slot": 0, "label": "amount", "type": "uint64"},
//                   {"slot": 1, "label": "addr", "type": "address"}
//                 ],
//                 "returns": [
//                   {"slot": 0, "label": "ok", "type": "bool"}
//                 ],
//                 "executes": {
//                   "hex": "0x13000310010140020001100300500403020501050A03040504000111000000015A040203410001041400031300025A0000031400020400015600110000"
//                 }
//               }
//             }
//           ]
//         }

//         // const logic: any = new Logic(abiInterface)
//         // logic.setProvider("http://149.102.155.207:1600/")

//         // console.log(logic.encodedManifest)

//         const provider = new JsonRpcProvider("http://localhost:1600/");
//         const factory = new LogicFactory(abiInterface, provider);

//         let options:any = {
//           builderName: "Seeder!",
//           arguments: ["MOI-Token", "MOI", 100000000, "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"]
//         }


//         let promise = factory.deploy(options, (err) => {
//           console.log("here", err)
//         }).send({
//             sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
//             fuelPrice: "030D40",
//             fuelLimit: "030D40"
//         })

//         let receipt
//         // console.log(promise)
//         await promise.then(async (result) => {
//           console.log(result)
//           await result.wait(result.hash).then((res) => {
//             receipt = res
//           }).catch(err => {
//             console.log(err)
//           })
//         }).catch((err) => {
//           console.log(err)
//         })

//         await new Promise((resolve, reject) => setTimeout(() => resolve(0), 500))

//         const logicId = receipt.ExtraData.logic_id;
//         const logic = new Logic(logicId, provider, abiInterface);
//         options = {
//           arguments: ["ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"]
//         }

//         promise = logic.routines.BalanceOf(options.arguments).send({
//             sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
//             fuelPrice: "030D40",
//             fuelLimit: "030D40"
//         })

//         return promise.then(async (result) => {
//           console.log(result)
//           await result.wait(result.hash).then((res) => {
//             console.log(res)
//           }).catch(err => {
//             console.log(err)
//           })
//         }).catch((err) => {
//           console.log(err)
//         })
//     })
// })

describe("checking address", () => {
  test("logic id", () => {
    const logicId = new LogicId("0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a")
    console.log(logicId.getAddress());
    
  })
})
