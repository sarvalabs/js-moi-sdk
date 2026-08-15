import { buildTransferPayload, InteractionContext } from "js-moi-interactions";
import { deriveAssetId } from "js-moi-identifiers";
import { RoutineOption } from "js-moi-logic";
import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { AssetActionPayload, AssetCreatePayload, Sender } from "js-moi-providers";
import { Signer } from "js-moi-signer"
import { OpType, AssetStandard, Hex, ErrorCode, ErrorUtils } from "js-moi-utils";
import { DEFAULT_STORAGE_FUND, KMOI_ASSET_ID } from "js-moi-constants";

/**
 * Deploys a custom (MASX) asset from a caller-supplied logic manifest.
 * MASX is the only standard that takes a client-supplied manifest - the
 * native standards (MAS0/MAS1/MAS2) have their manifest built into the blockchain
 * and are created via their own MAS0AssetLogic.create() / MAS1AssetLogic.create()
 * / MAS2AssetLogic.create() instead, not through this factory.
 */
export class AssetFactory {
    static create(
        signer: Signer,
        symbol: string, supply: number | bigint, manager: string,
        enableEvents: boolean, manifest: LogicManifest.Manifest,
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

        const option: RoutineOption | undefined = calldata.at(-1) instanceof RoutineOption ? calldata.at(-1) : undefined;

        // The node's DeployLogic only skips the deployer call when the manifest defines
        // no deploy routine at all - if it defines one or more, a callsite is required
        // to pick one and an empty callsite is rejected server-side (ErrInvalidCallSite),
        // same as an unmatched one. Mirror that here instead of always requiring a callsite.
        const deployRoutines = Object.values(manifest.elements)
            .filter((element): element is typeof element & { data: LogicManifest.Routine } => {
                return element.kind === "callable" && (element.data as LogicManifest.Routine).kind === "deploy";
            });

        if (callsite == null) {
            if (deployRoutines.length > 0) {
                ErrorUtils.throwError(
                    "Manifest defines one or more deploy routines - a callsite is required to select one.",
                    ErrorCode.MISSING_ARGUMENT
                );
            }

            payload.logic_payload = {
                manifest: ManifestCoder.encodeManifest(manifest) as Hex,
            }
        } else {
            const builder = deployRoutines.find(element => element.data.name === callsite);

            if(!builder) {
                ErrorUtils.throwError(
                    "No matching deploy routine found in manifest for the given callsite.",
                    ErrorCode.INVALID_ARGUMENT
                );
            }

            const builderRoutine = builder.data;

            const argsLen = calldata.at(-1) instanceof RoutineOption ? calldata.length - 1 : calldata.length;

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
                payload.logic_payload.calldata = manifestCoder.encodeArguments(callsite, ...calldata) as Hex;
            }
        }

        return new InteractionContext<OpType.ASSET_CREATE>({
            opType: OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
            // A newly created asset self-pays for its own storage (billed against its
            // own, currently-zero balance) the moment it's created, so it needs funds
            // bundled into the same interaction or the create reverts. See
            // deriveAssetId's docs for why this must mirror the blockchain's id derivation
            // exactly - a wrong prediction sends funds to the wrong account.
            fundingOperations: (sender: Sender) => {
                const assetId = deriveAssetId(sender, payload.standard);
                const transfer: AssetActionPayload = buildTransferPayload(
                    KMOI_ASSET_ID,
                    assetId.toHex(),
                    option?.storageFund ?? DEFAULT_STORAGE_FUND
                );

                return [{ type: OpType.ASSET_INVOKE, payload: transfer }];
            },
        })
    }
}
