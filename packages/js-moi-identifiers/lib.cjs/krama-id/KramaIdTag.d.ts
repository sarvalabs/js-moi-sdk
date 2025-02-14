import type { InvalidReason } from "../identifier";
import { KramaIdKind } from "./krama-id-enums";
export declare class KramaIdTag {
    readonly value: number;
    private static kindMaxSupportedVersion;
    constructor(value: number);
    getKind(): KramaIdKind;
    getVersion(): number;
    static validate(tag: KramaIdTag): InvalidReason | null;
}
//# sourceMappingURL=KramaIdTag.d.ts.map