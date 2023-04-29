import { JsonRpcProvider } from "moi-providers";
import {getLogicDriver} from "../src/logic";

describe("Test Logic Driver", () => {
    describe("Logic Execute", () => {
        it("should execute the erc20 routine", async() => {
            const provider = new JsonRpcProvider("http://localhost:1600/");
            const seederAddress = "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"
            const logicId = "0800007d70c34ed6ec4384c75d469894052647a078b33ac0f08db0d3751c1fce29a49a"
            const logicDriver = await getLogicDriver(logicId, provider);
            const name = await logicDriver.persistentState.get("name")
            expect(name).toBe("MOI-Token")

            const response = await logicDriver.routines.BalanceOf([seederAddress]).send({
                sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
                fuelPrice: "0x130D41",
                fuelLimit: "0x130D41"
            });

            const receipt = await response.wait(response.hash);
            expect(receipt).toBeDefined();

            const result = await response.result(response.hash);
            expect(result).toBeDefined();
            expect(result.output.balance).toBe(100000000)
        })
    })
})
