import { getLogicDriver } from "./packages/js-moi-logic";
import { Wallet } from "./packages/js-moi-wallet";

const wallet = new Wallet()
const logicDriver = getLogicDriver("0x0000000", wallet);
