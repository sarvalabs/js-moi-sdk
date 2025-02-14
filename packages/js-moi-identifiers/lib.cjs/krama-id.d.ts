import type { InvalidReason } from "./identifier";
import { type Hex } from "./utils";
export declare enum NetworkZone {
    Zone0 = 0,
    Zone1 = 1,
    Zone2 = 2,
    Zone3 = 3
}
export declare enum KramaIdKind {
    Guardian = 0
}
export declare const KramaIdV0 = 0;
export declare class KramaIdTag {
    readonly value: number;
    private static kindMaxSupportedVersion;
    constructor(value: number);
    getKind(): KramaIdKind;
    getVersion(): number;
    static validate(tag: KramaIdTag): InvalidReason | null;
}
declare class KramaIdMetadata {
    readonly value: number;
    constructor(value: number);
    getZone(): NetworkZone;
}
export declare class KramaId {
    private readonly value;
    private constructor();
    private getPeerIdLength;
    getTag(): KramaIdTag;
    getMetadata(): KramaIdMetadata;
    getPeerId(): string;
    getDecodedPeerId(): Promise<import("@libp2p/interface", { with: { "resolution-mode": "import" } }).Ed25519PeerId | import("@libp2p/interface", { with: { "resolution-mode": "import" } }).Secp256k1PeerId | import("@libp2p/interface", { with: { "resolution-mode": "import" } }).RSAPeerId | import("@libp2p/interface", { with: { "resolution-mode": "import" } }).URLPeerId>;
    toString(): string;
    toJSON(): string;
    static peerIdFromPrivateKey(privateKey: Uint8Array): Promise<import("@libp2p/interface", { with: { "resolution-mode": "import" } }).PeerId>;
    static fromPrivateKey(zone: NetworkZone, privateKey: Uint8Array | Hex): Promise<KramaId>;
    static fromPeerId(kind: KramaIdKind, version: number, zone: NetworkZone, peerId: string): KramaId;
}
export {};
//# sourceMappingURL=krama-id.d.ts.map