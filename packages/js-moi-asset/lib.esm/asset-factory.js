import { InteractionContext } from "js-moi-interactions";
import { RoutineOption } from "js-moi-logic";
import { ManifestCoder } from "js-moi-manifest";
import { OpType, AssetStandard, ErrorCode, ErrorUtils } from "js-moi-utils";
export class AssetFactory {
    static create(signer, symbol, supply, manager, enableEvents, manifest, callsite, ...calldata) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MAS0,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
        };
        if (manifest != null) {
            const builder = Object.values(manifest.elements)
                .find(element => {
                if (element.kind === "routine") {
                    const routine = element.data;
                    return routine.kind === "deploy" &&
                        callsite === routine.name;
                }
                return false;
            });
            if (builder) {
                const builderRoutine = builder.data;
                const argsLen = calldata.at(-1) && calldata.at(-1) instanceof RoutineOption ? calldata.length - 1 : calldata.length;
                if (builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                    ErrorUtils.throwError("One or more required arguments are missing.", ErrorCode.MISSING_ARGUMENT);
                }
                payload.logic_payload = {
                    manifest: ManifestCoder.encodeManifest(manifest),
                    callsite: callsite,
                };
                if (argsLen > 0) {
                    const manifestCoder = new ManifestCoder(manifest);
                    payload.logic_payload.calldata = manifestCoder.encodeArguments(callsite, calldata);
                }
            }
        }
        return new InteractionContext({
            opType: OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
        });
    }
}
//# sourceMappingURL=asset-factory.js.map