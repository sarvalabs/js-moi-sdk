import type { ManifestCoderFormat } from "js-moi-manifest";
import type { Hex, LogicManifest } from "js-moi-utils";
export type ManifestValueFormat<T extends ManifestCoderFormat> = T extends ManifestCoderFormat.POLO ? Hex : LogicManifest;
//# sourceMappingURL=utils.d.ts.map