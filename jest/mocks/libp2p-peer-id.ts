// Stub for packages that transitively load js-moi-identifiers/krama-id but do not
// exercise KramaId behavior. js-moi-identifiers tests use the real @libp2p/peer-id.
export function peerIdFromString(peerId: string) {
    return {
        toString() {
            return peerId;
        },
    };
}

export function peerIdFromMultihash(_digest: unknown) {
    return {
        toString() {
            return "16Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E";
        },
    };
}
