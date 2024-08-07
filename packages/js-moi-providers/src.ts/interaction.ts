import { ErrorCode, ErrorUtils, IxType, assetCreateSchema, assetMintOrBurnSchema, bytesToHex, logicDeploySchema, logicInteractSchema, toQuantity } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { ProcessedIxObject } from "../types/interaction";
import { AssetActionPayload, AssetSupplyPayload, CallorEstimateIxObject, InteractionPayload, IxStep, IxParticipant, LogicPayload } from "../types/jsonrpc";

const serializePayload = (ixType: IxType, payload: InteractionPayload): Uint8Array => {
    let polorizer = new Polorizer()
    switch(ixType) {
        case IxType.ASSET_CREATE:
            polorizer.polorize(payload, assetCreateSchema);
            return polorizer.bytes()
        case IxType.ASSET_MINT:
        case IxType.ASSET_BURN:
            polorizer.polorize(payload, assetMintOrBurnSchema);
            return polorizer.bytes()
        case IxType.LOGIC_DEPLOY:
            polorizer.polorize(payload, logicDeploySchema);
            return polorizer.bytes()
        case IxType.LOGIC_INVOKE:
        case IxType.LOGIC_ENLIST:
            polorizer.polorize(payload, logicInteractSchema);
            return polorizer.bytes()
        default:
            ErrorUtils.throwError(
                "Failed to serialize payload", 
                ErrorCode.UNKNOWN_ERROR
            )
    }
}

const createParticipants = (steps: IxStep[]): IxParticipant[] => {
    return steps.map(step => {
        switch(step.type) {
            case IxType.ASSET_CREATE:
                return null
            case IxType.ASSET_MINT:
            case IxType.ASSET_BURN:
                return {
                    address: (step.payload as AssetSupplyPayload).asset_id.slice(10,),
                    lock_type: 1,
                }
            case IxType.VALUE_TRANSFER:
                return {
                    address: (step.payload as AssetActionPayload).beneficiary,
                    lock_type: 1,
                }
            case IxType.LOGIC_DEPLOY:
            case IxType.LOGIC_ENLIST:
            case IxType.LOGIC_INVOKE:
                return {
                    address: (step.payload as LogicPayload).logic_id.slice(10,),
                    lock_type: 1
                }
            default:
                ErrorUtils.throwError("Unsupported Ix type", ErrorCode.INVALID_ARGUMENT);
        }
    }).filter(step => step !=  null)
}

/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
export const processIxObject = (ixObject: CallorEstimateIxObject): ProcessedIxObject => {
    try {
        const processedIxObject: ProcessedIxObject = { 
            nonce: toQuantity(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: toQuantity(ixObject.fuel_price),
            fuel_limit: toQuantity(ixObject.fuel_limit),
            asset_funds: ixObject.asset_funds,
            transactions: [],
            participants: [
                {
                    address: ixObject.sender,
                    lock_type: 1,
                },
                ...createParticipants(ixObject.transactions)
            ],
        };

        processedIxObject.transactions = ixObject.transactions.map(step => ({
            ...step, 
            payload: "0x" + bytesToHex(serializePayload(step.type, step.payload)),
        }))

        return processedIxObject;
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to process interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    } 
}
