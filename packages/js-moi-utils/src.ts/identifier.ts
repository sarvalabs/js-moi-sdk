import type { AssetStandard } from "./enums";
import { ErrorUtils } from "./errors";
import { ensureHexPrefix, hexToBytes, isHex, type Address, type Hex } from "./hex";

const LOGIC_V0_LEN = 35;
const ASSET_V0_LEN = 36;

export class LogicId {
    public readonly value: Hex;

    constructor(value: Hex) {
        if (!LogicId.isValid(value)) {
            ErrorUtils.throwArgumentError("Invalid LogicId", "value", value);
        }

        this.value = ensureHexPrefix(value);
    }

    isPersistent(): boolean {
        const bit = (this.getBytes()?.[0] >> 3) & 0x1;
        return bit != 0;
    }

    isEphemeral() {
        const bit = (this.getBytes()?.[0] >> 2) & 0x1;
        return bit != 0;
    }

    isIntractable() {
        const bit = (this.getBytes()?.[0] >> 1) & 0x1;
        return bit != 0;
    }

    isAssetLogic() {
        const bit = this.getBytes()?.[0] & 0x1;
        return bit != 0;
    }

    getEdition(): number {
        const blob = this.getBytes().slice(1, 3);
        return new DataView(blob.buffer).getUint16(0, false);
    }

    getBytes(): Uint8Array {
        return hexToBytes(this.value);
    }

    getAddress(): Address {
        return ensureHexPrefix(this.value.slice(this.value.length - 64));
    }

    toString(): string {
        return this.value;
    }

    getVersion() {
        return 0;
    }

    static isValid(value: unknown): value is Hex {
        if (!isHex(value) || value.length % 2 !== 0) {
            return false;
        }

        const bytes = hexToBytes(value);

        if (bytes.length < 1) {
            return false;
        }

        const version = bytes[0] & 0xf0;

        switch (version) {
            case 0: {
                return bytes.length === LOGIC_V0_LEN;
            }

            default: {
                return false;
            }
        }
    }
}

export class AssetId {
    public readonly value: Hex;

    constructor(value: Hex) {
        if (!AssetId.isValid(value)) {
            ErrorUtils.throwArgumentError("Invalid AssetId", "value", value);
        }

        this.value = ensureHexPrefix(value);
    }

    getBytes(): Uint8Array {
        return hexToBytes(this.value);
    }

    getVersion() {
        return 0;
    }

    isLogical() {
        const bit = (this.getBytes()?.[0] >> 3) & 0x1;
        return bit != 0;
    }

    isStateful() {
        const bit = (this.getBytes()?.[0] >> 2) & 0x1;
        return bit != 0;
    }

    getDimension() {
        return this.getBytes()?.[1];
    }

    getStandard(): AssetStandard {
        const buff = this.getBytes().slice(2, 4);
        const standard = new DataView(buff.buffer).getUint16(0, false);
        return standard;
    }

    getAddress(): Address {
        return ensureHexPrefix(this.value.slice(this.value.length - 64));
    }

    static isValid(value: unknown): value is Hex {
        if (!isHex(value) || value.length % 2 !== 0) {
            return false;
        }

        const buff = hexToBytes(value);

        if (buff.length < 1) {
            return false;
        }

        const version = buff[0] & 0xf0;

        switch (version) {
            case 0: {
                return buff.length === ASSET_V0_LEN;
            }

            default: {
                return false;
            }
        }
    }
}
