import BN from "bn.js";

export const numToHex = (value: number | bigint | BN): string => {
    if (!BN.isBN(value)) {
        value = new BN(value)   
    }
    
    if (value.lt(new BN(0))) {
        throw new Error('Input must be a positive BN value');
    }
  
    const bigNum = new BN(value.toString()); // Convert bigint to bn.js BN instance

    return bigNum.toString(16).toUpperCase();
}

export const toQuantity = (value: number | bigint | BN): string => {
  try {
    return "0x" + numToHex(value)
  } catch(err) {
    throw err
  }
}

export const encodeToString = (data: Uint8Array): string => {
    return Buffer.from(data).toString('hex');
}

export const hexToBytes = (str: string): Uint8Array => {
    const hex = str.replace(/^0x/, '').trim();
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string');
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, 2), 16);
    }

    return bytes;
}

export const hexToBN = (hex: string): bigint | number => {
    let value: BN;

    hex = hex.replace(/^0x/, '').trim();
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string');
    }

    value = new BN(hex, 16);
  
    // Check if the number is too large to fit in a number
    if (value.bitLength() > 53) {
      // If so, return it as a BigInt
      return BigInt(`0x${value.toString(16)}`);
    }

    // Otherwise, return it as a number
    return value.toNumber();
}

export const bytesToHex = (data: Uint8Array): string => {
  return Buffer.from(data).toString('hex');
}

export const uint8ToHex = (arr: Uint8Array): string => {
  let hexString = ""
  for (let byte of arr) {
      let _byte = byte.toString(16).padStart(2, "0")
      hexString += _byte
  }
  return hexString
}