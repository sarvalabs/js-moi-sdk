// import erc20 from "../manifests/erc20.json";
// import {JsonRpcProvider} from "moi-providers";
// import {LogicFactory} from "../src/factory";

describe("Test Logic Deploy", () => {
    describe("deploy", () => {
        it("should deploy the erc20 logic", async() => {
            // const provider = new JsonRpcProvider("http://localhost:1600/");
            // const factory = new LogicFactory(erc20, provider);
            // const expectedLogicId = "0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a"
            // const options:any = {
            //     builderName: "Seeder!",
            //     arguments: [
            //         "MOI-Token", 
            //         "MOI", 
            //         100000000, 
            //         "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"
            //     ]
            // }

            // const callBack = (err) => {
            //     expect(err).toBeNull()
            // }

            // const response = await factory.deploy(options, callBack).send({
            //     sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
            //     fuelPrice: "0x130D41",
            //     fuelLimit: "0x130D41"
            // });
            // expect(response).toBeDefined();

            // const receipt = await response.wait(response.hash);
            // expect(receipt).toBeDefined();

            // const result = await response.result(response.hash);
            // expect(result).toBeDefined();
            // expect(result.logic_id).toBe(expectedLogicId)
        })
    })
})
