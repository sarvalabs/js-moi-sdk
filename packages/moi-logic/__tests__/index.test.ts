import { ABICoder } from "moi-abi";
import { LogicManifest } from "moi-utils";
// import { JsonRpcProvider } from "../../moi-providers/src";
// import {LogicFactory} from "../src/factory";
// import { getLogicObject } from "../src/logic";
// import { Logic } from "../src/logic";

// import LogicId from "../src/logic_id"

describe("Testing Contract", () => {
    test("Constructor", async () => {
        const abiInterface = {
          "syntax": "0.1.0",
          "engine": {
            "kind": "PISA",
            "flags": []
          },
          "elements": [{
              "ptr": 0,
              "kind": "state",
              "deps": [
                1
              ],
              "data": {
                "kind": "persistent",
                "fields": [{
                  "slot": 0,
                  "label": "registry",
                  "type": "map[string]Person"
                }]
              }
            },
            {
              "ptr": 1,
              "kind": "class",
              "data": {
                "name": "Person",
                "fields": [{
                    "slot": 0,
                    "label": "name",
                    "type": "string"
                  },
                  {
                    "slot": 1,
                    "label": "age",
                    "type": "Personn"
                  },
                  {
                    "slot": 2,
                    "label": "gender",
                    "type": "string"
                  }
                ]
              }
            },
            {
              "ptr": 2,
              "kind": "routine",
              "deps": [
                0,
                1
              ],
              "data": {
                "name": "StorePerson!",
                "kind": "invokable",
                "accepts": [{
                  "slot": 0,
                  "label": "person",
                  "type": "Person"
                }],
                "executes": {
                  "bin": [
                    4,
                    0,
                    0,
                    81,
                    1,
                    0,
                    0,
                    128,
                    2,
                    0,
                    84,
                    2,
                    1,
                    0,
                    129,
                    2,
                    0
                  ]
                }
              }
            },
            {
              "ptr": 3,
              "kind": "routine",
              "deps": [
                0,
                1
              ],
              "data": {
                "name": "GetPerson",
                "kind": "invokable",
                "accepts": [{
                  "slot": 0,
                  "label": "name",
                  "type": "string"
                }],
                "returns": [{
                  "slot": 0,
                  "label": "person",
                  "type": "Person"
                }],
                "executes": {
                  "bin": [
                    128,
                    0,
                    0,
                    4,
                    1,
                    0,
                    83,
                    2,
                    0,
                    1,
                    5,
                    2,
                    0
                  ]
                }
              }
            },
            {
              "ptr": 4,
              "kind": "routine",
              "deps": [
                1
              ],
              "data": {
                "name": "GetNameOf",
                "kind": "invokable",
                "accepts": [{
                  "slot": 0,
                  "label": "person",
                  "type": "Person"
                }],
                "returns": [{
                  "slot": 0,
                  "label": "name",
                  "type": "string"
                }],
                "executes": {
                  "bin": [
                    4,
                    0,
                    0,
                    81,
                    1,
                    0,
                    0,
                    5,
                    1,
                    0
                  ]
                }
              }
            },
            {
              "ptr": 5,
              "kind": "routine",
              "deps": [
                1
              ],
              "data": {
                "name": "DoubleAge",
                "kind": "invokable",
                "accepts": [{
                  "slot": 0,
                  "label": "person",
                  "type": "Person"
                }],
                "returns": [{
                  "slot": 0,
                  "label": "person",
                  "type": "Person"
                }],
                "executes": {
                  "bin": [
                    4,
                    0,
                    0,
                    81,
                    1,
                    0,
                    1,
                    36,
                    2,
                    1,
                    101,
                    2,
                    2,
                    1,
                    82,
                    0,
                    1,
                    2,
                    5,
                    0,
                    0
                  ]
                }
              }
            },
            {
              "ptr": 6,
              "kind": "class",
              "data": {
                "name": "Personn",
                "fields": [{
                    "slot": 0,
                    "label": "name",
                    "type": "string"
                  },
                  {
                    "slot": 1,
                    "label": "gender",
                    "type": "string"
                  }
                ]
              }
            },
          ]
        }

        let classDefs:Map<string, number> = new Map();
        let elements:Map<number, LogicManifest.Element> = new Map();
        abiInterface.elements.forEach(element => {
          if(element.kind == "class") {
            classDefs.set(element.data.name, element.ptr)
          }
          elements.set(element.ptr, element)
        })
        const abiCoder = new ABICoder(elements, classDefs)
        const obj = {
          name: "gokul",
          age: {
            name: "gokul",
            gender: "male"
          },
          gender: "male"
        }
        const manifest = abiCoder.encodeArguments(abiInterface.elements[2].data.accepts, [obj])
        console.log(manifest)

        // const logic: any = new Logic(abiInterface)
        // logic.setProvider("http://149.102.155.207:1600/")

        // console.log(logic.encodedManifest)

        // const provider = new JsonRpcProvider("http://localhost:1600/");
        // const factory = new LogicFactory(abiInterface, provider);

        // let options:any = {
        //   builderName: "Seeder!",
        //   arguments: ["MOI-Token", "MOI", 100000000, "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"]
        // }


        // let promise = factory.deploy(options, (err) => {
        //   console.log("here", err)
        // }).send({
        //     sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
        //     fuelPrice: "0x130D41",
        //     fuelLimit: "0x130D41"
        // })

        // // let receipt
        // // console.log(promise)
        // await promise.then(async (result) => {
        //   console.log(result)
        //   await result.wait(result.hash).then((res) => {
        //     console.log(res)
        //   }).catch(err => {
        //     console.log(err)
        //   })
        // }).catch((err) => {
        //   console.log(err)
        // })

        // await new Promise((resolve, reject) => setTimeout(() => resolve(0), 500))

        // const logicId = receipt.ExtraData.logic_id;
        // try {
        //   const logic = await getLogicObject("0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a", provider);
        //   const options = {
        //     arguments: ["ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"]
        //   }
  
        //   const promise = logic.routines.BalanceOf(options.arguments).send({
        //       sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
        //       fuelPrice: "0x130D41",
        //       fuelLimit: "0x130D41"
        //   })
  
        //   return promise.then(async (result) => {
        //     console.log(result)
        //     await result.result(result.hash).then((res) => {
        //       console.dir(res, { depth: null })
        //     }).catch(err => {
        //       console.log(err)
        //     })
        //   }).catch((err) => {
        //     console.log(err)
        //   })
        // } catch(err) {
        //   console.log(err)
        // }
    })
})

// describe("checking address", () => {
//   test("logic id", () => {
//     const logicId = new LogicId("0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a")
//     console.log(logicId.getAddress());
    
//   })
// })
