import { Hex } from "../types/hex";
import BN from "bn.js";

export const toHex = (hexValue: string): Hex => {
    if (!/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
        throw new Error('Invalid hex value');
    }

    return hexValue as Hex;
}

export const bigintToHex = (value: number | bigint | BN): Hex => {
    if (!BN.isBN(value)) {
        value = new BN(value)   
    }
    
    if (value.lt(new BN(0))) {
        throw new Error('Input must be a positive BN value');
    }
  
    const bigNum = new BN(value.toString()); // Convert bigint to bn.js BN instance

    return bigNum.toString(16).toUpperCase() as Hex;
}