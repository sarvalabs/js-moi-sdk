import { InteractionContext } from "js-moi-interactions";
import { RoutineOption } from "js-moi-logic";
import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { AssetCreatePayload } from "js-moi-providers";
import { Signer } from "js-moi-signer"
import { OpType, AssetStandard, Hex, ErrorCode, ErrorUtils } from "js-moi-utils";

export class AssetFactory {
    static create(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string, 
        enableEvents: boolean, manifest?: LogicManifest.Manifest, 
        callsite?: string, ...calldata: any[]
    ): InteractionContext<OpType.ASSET_CREATE> {
        const payload: AssetCreatePayload = {
            symbol: symbol,
            max_supply: supply,
            standard: AssetStandard.MASX,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager as Hex,
        }

        if(manifest != null) {
            const builder = Object.values(manifest.elements)
            .find(element => {
                if(element.kind === "callable"){
                    const routine = element.data as LogicManifest.Routine;
                    return routine.kind === "deploy" && 
                    callsite === routine.name;
                }
                return false;
            });

            if(builder) {
                const builderRoutine = builder.data as LogicManifest.Routine;

                const argsLen = calldata.at(-1) && calldata.at(-1) instanceof RoutineOption ? calldata.length - 1 : calldata.length;

                
                if(builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                    ErrorUtils.throwError(
                        "One or more required arguments are missing.",
                        ErrorCode.MISSING_ARGUMENT
                    );
                }

                payload.logic_payload = {
                    manifest: ManifestCoder.encodeManifest(manifest) as Hex,
                    callsite: callsite,
                }

                if(argsLen > 0) {
                    const manifestCoder = new ManifestCoder(manifest)
                    payload.logic_payload.calldata = manifestCoder.encodeArguments(callsite, calldata) as Hex;
                }
            }
        }

        return new InteractionContext<OpType.ASSET_CREATE>({
            opType: OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
        })
    }
}
