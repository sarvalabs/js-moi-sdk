import { ErrorCode, ErrorUtils, TxType, assetCreateSchema, assetMintOrBurnSchema, bytesToHex, logicSchema, toQuantity } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { ProcessedIxObject } from "../types/interaction";
import { AssetActionPayload, AssetSupplyPayload, CallorEstimateIxObject, InteractionPayload, IxParticipant, LogicPayload, IxTransaction } from "../types/jsonrpc";

const serializePayload = (ixType: TxType, payload: InteractionPayload): Uint8Array => {
    let polorizer = new Polorizer()
    switch(ixType) {
        case TxType.ASSET_CREATE:
            polorizer.polorize(payload, assetCreateSchema);
            return polorizer.bytes()
        case TxType.ASSET_MINT:
        case TxType.ASSET_BURN:
            polorizer.polorize(payload, assetMintOrBurnSchema);
            return polorizer.bytes()
        case TxType.LOGIC_DEPLOY:
        case TxType.LOGIC_INVOKE:
        case TxType.LOGIC_ENLIST:
            polorizer.polorize(payload, logicSchema);
            return polorizer.bytes()
        default:
            ErrorUtils.throwError(
                "Failed to serialize payload", 
                ErrorCode.UNKNOWN_ERROR
            )
    }
}

const createParticipants = (transactions: IxTransaction[]): IxParticipant[] => {
    return transactions.map(transaction => {
        switch(transaction.type) {
            case TxType.ASSET_CREATE:
                return null
            case TxType.ASSET_MINT:
            case TxType.ASSET_BURN:
                return {
                    address: (transaction.payload as AssetSupplyPayload).asset_id.slice(10,),
                    lock_type: 1,
                }
            case TxType.VALUE_TRANSFER:
                return {
                    address: (transaction.payload as AssetActionPayload).beneficiary,
                    lock_type: 1,
                }
            case TxType.LOGIC_DEPLOY:
                return null
            case TxType.LOGIC_ENLIST:
            case TxType.LOGIC_INVOKE:
                return {
                    address: (transaction.payload as LogicPayload).logic_id.slice(10,),
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
