"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFactory = void 0;
const js_moi_interactions_1 = require("js-moi-interactions");
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_moi_logic_1 = require("js-moi-logic");
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_constants_1 = require("js-moi-constants");
/**
 * Deploys a custom (MASX) asset from a caller-supplied logic manifest.
 * MASX is the only standard that takes a client-supplied manifest - the
 * native standards (MAS0/MAS1/MAS2) have their manifest built into the blockchain
 * and are created via their own MAS0AssetLogic.create() / MAS1AssetLogic.create()
 * / MAS2AssetLogic.create() instead, not through this factory.
 */
class AssetFactory {
    static create(signer, symbol, supply, manager, enableEvents, manifest, callsite, ...calldata) {
        const payload = {
            symbol: symbol,
            max_supply: supply,
            standard: js_moi_utils_1.AssetStandard.MASX,
            dimension: 0,
            enable_events: enableEvents,
            manager: manager,
        };
        const option = calldata.at(-1) instanceof js_moi_logic_1.RoutineOption ? calldata.at(-1) : undefined;
        // The node's DeployLogic only skips the deployer call when the manifest defines
        // no deploy routine at all - if it defines one or more, a callsite is required
        // to pick one and an empty callsite is rejected server-side (ErrInvalidCallSite),
        // same as an unmatched one. Mirror that here instead of always requiring a callsite.
        const deployRoutines = Object.values(manifest.elements)
            .filter((element) => {
            return element.kind === "callable" && element.data.kind === "deploy";
        });
        if (callsite == null) {
            if (deployRoutines.length > 0) {
                js_moi_utils_1.ErrorUtils.throwError("Manifest defines one or more deploy routines - a callsite is required to select one.", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            payload.logic_payload = {
                manifest: js_moi_manifest_1.ManifestCoder.encodeManifest(manifest),
            };
        }
        else {
            const builder = deployRoutines.find(element => element.data.name === callsite);
            if (!builder) {
                js_moi_utils_1.ErrorUtils.throwError("No matching deploy routine found in manifest for the given callsite.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            const builderRoutine = builder.data;
            const argsLen = calldata.at(-1) instanceof js_moi_logic_1.RoutineOption ? calldata.length - 1 : calldata.length;
            if (builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            payload.logic_payload = {
                manifest: js_moi_manifest_1.ManifestCoder.encodeManifest(manifest),
                callsite: callsite,
            };
            if (argsLen > 0) {
                const manifestCoder = new js_moi_manifest_1.ManifestCoder(manifest);
                payload.logic_payload.calldata = manifestCoder.encodeArguments(callsite, ...calldata);
            }
        }
        return new js_moi_interactions_1.InteractionContext({
            opType: js_moi_utils_1.OpType.ASSET_CREATE,
            payload: payload,
            participants: [],
            signer: signer,
            // A newly created asset self-pays for its own storage (billed against its
            // own, currently-zero balance) the moment it's created, so it needs funds
            // bundled into the same interaction or the create reverts. See
            // deriveAssetId's docs for why this must mirror the blockchain's id derivation
            // exactly - a wrong prediction sends funds to the wrong account.
            fundingOperations: (sender) => {
                const assetId = (0, js_moi_identifiers_1.deriveAssetId)(sender, payload.standard);
                const transfer = (0, js_moi_interactions_1.buildTransferPayload)(js_moi_constants_1.KMOI_ASSET_ID, assetId.toHex(), option?.storageFund ?? js_moi_constants_1.DEFAULT_STORAGE_FUND);
                return [{ type: js_moi_utils_1.OpType.ASSET_INVOKE, payload: transfer }];
            },
        });
    }
}
exports.AssetFactory = AssetFactory;
//# sourceMappingURL=asset-factory.js.map