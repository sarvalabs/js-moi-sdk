import { ErrorCode, ErrorUtils, TxType, hexToBytes, trimHexPrefix, ixObjectSchema, 
    assetCreateSchema, assetSupplySchema, assetActionSchema, 
    logicSchema, LockType} from "js-moi-utils";
import { InteractionPayload, LogicPayload, InteractionObject, AssetActionPayload, AssetSupplyPayload, IxTransaction } from "js-moi-providers";
import { ProcessedIxParticipant, ProcessedIxObject } from "js-moi-signer";
import { ZERO_ADDRESS } from "js-moi-constants";
import { Polorizer } from "js-polo";

/**
 * Processes the payload based on the interaction type.
 *
 * @param {TxType} ixType - The interaction type.
 * @param {InteractionPayload} payload - The interaction payload.
 * @returns {InteractionPayload} - The processed interaction payload.
 * @throws {Error} - Throws an error if the interaction type is unsupported.
 */
const processPayload = (ixType: TxType, payload: InteractionPayload): InteractionPayload => {
    switch(ixType) {
        case TxType.ASSET_CREATE:
            return { ...payload }
        case TxType.ASSET_MINT:
        case TxType.ASSET_BURN:
            payload = payload as AssetSupplyPayload;
            return {
                ...payload,
                asset_id: trimHexPrefix(payload.asset_id)
            }
        case TxType.VALUE_TRANSFER:
            const pay = payload as AssetActionPayload;
            return {
                ...pay,
                benefactor: hexToBytes(pay.benefactor ? pay.benefactor : ZERO_ADDRESS),
                beneficiary: hexToBytes(pay.beneficiary),
                asset_id: trimHexPrefix(pay.asset_id)
            } as unknown
        case TxType.LOGIC_DEPLOY:
            return { ...payload };
        case TxType.LOGIC_INVOKE:
        case TxType.LOGIC_ENLIST:
            payload = payload as LogicPayload;
            return {
                ...payload,
                logic_id: trimHexPrefix(payload.logic_id)
            }
        default:
            ErrorUtils.throwError(
                "Failed to process payload, unexpected interaction type", 
                ErrorCode.UNEXPECTED_ARGUMENT
            )
    }
}

const createParticipants = (steps: IxTransaction[]): ProcessedIxParticipant[] => {
    return steps.reduce((participants, step) => {
        let address: Uint8Array | null = null;
        let lockType: number | null = null;

        switch (step.type) {
            case TxType.ASSET_CREATE:
                break
            case TxType.ASSET_MINT:
            case TxType.ASSET_BURN:
                address = hexToBytes((step.payload as AssetSupplyPayload).asset_id.slice(10,));
                lockType = LockType.MUTATE_LOCK
                break;
            case TxType.VALUE_TRANSFER:
                address = hexToBytes((step.payload as AssetActionPayload).beneficiary);
                lockType = LockType.MUTATE_LOCK
                break;
            case TxType.LOGIC_DEPLOY:
                break;
            case TxType.LOGIC_ENLIST:
            case TxType.LOGIC_INVOKE:
                address = hexToBytes((step.payload as LogicPayload).logic_id.slice(6,));
                lockType = LockType.MUTATE_LOCK
                break;
            default:
                ErrorUtils.throwError("Unsupported Ix type", ErrorCode.INVALID_ARGUMENT);
        }

        if (address !== null && lockType !== null) {
            participants.push({ address, lock_type: lockType });
        }

        return participants;
    }, [] as ProcessedIxParticipant[]);
};

/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {InteractionObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject: InteractionObject): ProcessedIxObject => {
    try {
        const processedIxObject: ProcessedIxObject = { 
            sender: hexToBytes(ixObject.sender),
            payer: hexToBytes(ZERO_ADDRESS),
            nonce: ixObject.nonce,
            fuel_price: ixObject.fuel_price,
            fuel_limit: ixObject.fuel_limit,

            asset_funds: ixObject.asset_funds,
            transactions: [],
            participants: [
                {
                    address: hexToBytes(ixObject.sender),
                    lock_type: 1,
                },
                ...createParticipants(ixObject.transactions)
            ],
        };

        processedIxObject.transactions = ixObject.transactions.map(step => {
            if(!step.payload) {
                ErrorUtils.throwError(
                    "Payload is missing!",
                    ErrorCode.MISSING_ARGUMENT
                )
            }

            const payload = processPayload(step.type, step.payload);
            const polorizer = new Polorizer();

            switch(step.type) {
                case TxType.VALUE_TRANSFER:
                    polorizer.polorize(payload, assetActionSchema)
                    return {...step, payload: polorizer.bytes()}
                case TxType.ASSET_CREATE:
                    polorizer.polorize(payload, assetCreateSchema)
                    return {...step, payload: polorizer.bytes()}
                case TxType.ASSET_MINT:
                case TxType.ASSET_BURN:
                    polorizer.polorize(payload, assetSupplySchema)
                    return {...step, payload: polorizer.bytes()}
                case TxType.LOGIC_DEPLOY:
                case TxType.LOGIC_INVOKE:
                case TxType.LOGIC_ENLIST:
                    polorizer.polorize(payload, logicSchema)
                    return {...step, payload: polorizer.bytes()}
                default:
                    ErrorUtils.throwError(
                        "Unsupported interaction type!", 
                        ErrorCode.UNSUPPORTED_OPERATION
                    );
            }
        })

        return processedIxObject;
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to process interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    }
}

/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
export const serializeIxObject = (ixObject: InteractionObject): Uint8Array => {
    try {
        const processedIxObject = processIxObject(ixObject);
        const polorizer = new Polorizer();
        polorizer.polorize(processedIxObject, ixObjectSchema);
        return polorizer.bytes();
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to serialize interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    }
}
