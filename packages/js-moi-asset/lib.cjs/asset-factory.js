"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFactory = void 0;
const js_moi_interactions_1 = require("js-moi-interactions");
const js_moi_logic_1 = require("js-moi-logic");
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
class AssetFactory {
    static create(signer, symbol, supply, manager, enableEvents, manifest, callsite, ...calldata) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: js_moi_utils_1.AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
        };
        if (manifest != null) {
            const builder = Object.values(manifest.elements)
                .find(element => {
                if (element.kind === "callable") {
                    const routine = element.data;
                    return routine.kind === "deploy" &&
                        callsite === routine.name;
                }
                return false;
            });
            if (builder) {
                const builderRoutine = builder.data;
                const argsLen = calldata.at(-1) && calldata.at(-1) instanceof js_moi_logic_1.RoutineOption ? calldata.length - 1 : calldata.length;
                if (builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                    js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
                }
                payload.logic_payload = {
                    manifest: js_moi_manifest_1.ManifestCoder.encodeManifest(manifest),
                    callsite: callsite,
                };
                if (argsLen > 0) {
                    const manifestCoder = new js_moi_manifest_1.ManifestCoder(manifest);
                    payload.logic_payload.calldata = manifestCoder.encodeArguments(callsite, calldata);
                }
            }
        }
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
        });
    }
}
exports.AssetFactory = AssetFactory;
//# sourceMappingURL=asset-factory.js.map