import { Hex } from "../types/hex";
import BN from "bn.js";
export declare const toHex: (hexValue: string) => Hex;
export declare const bigintToHex: (value: number | bigint | BN) => Hex;
