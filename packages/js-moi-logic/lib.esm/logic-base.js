import { ManifestCoder } from "js-moi-manifest";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, hexToBytes, IxType } from "js-moi-utils";
import ElementDescriptor from "./element-descriptor";
const DEFAULT_FUEL_PRICE = 1;
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export class LogicBase extends ElementDescriptor {
    signer;
    provider;
    manifestCoder;
    constructor(manifest, arg) {
        super(manifest.elements);
        this.manifestCoder = new ManifestCoder(this.elements, this.classDefs);
        this.connect(arg);
    }
    /**
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    getLogicId() {
        return "";
    }
    /**
     * Updates the signer and provider instances for the LogicBase instance.
     *
     * @param {Signer | AbstractProvider} arg -  The signer or provider instance.
     */
    connect(arg) {
        if (arg instanceof Signer) {
            this.signer = arg;
            this.provider = arg.getProvider();
            return;
        }
        this.provider = arg;
    }
    /**
     * Executes a routine with the given arguments and returns the interaction response.
     *
     * @param {any} ixObject - The interaction object.
     * @param {any[]} args - The arguments for the routine.
     * @returns {Promise<InteractionResponse>} A promise that resolves to the
     * interaction response.
     * @throws {Error} if the provider is not initialized within the signer,
     * if the logic id is not defined, if the method type is unsupported,
     * or if the sendInteraction operation fails.
     */
    async executeRoutine(ixObject, method, option) {
        if (this.getIxType() !== IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError("This logic object doesn't have address set yet, please set an address first.", ErrorCode.NOT_INITIALIZED);
        }
        const { type, params } = this.processArguments(ixObject, method, option);
        switch (type) {
            case "call": {
                const response = await this.provider.call(params);
                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            case "estimate": {
                if (!this.signer?.isInitialized()) {
                    ErrorUtils.throwError("Mutating routine calls require a signer to be initialized.", ErrorCode.NOT_INITIALIZED);
                }
                return this.provider.estimateFuel(params);
            }
            case "send": {
                if (!this.signer?.isInitialized()) {
                    ErrorUtils.throwError("Mutating routine calls require a signer to be initialized.", ErrorCode.NOT_INITIALIZED);
                }
                // @ts-ignore
                params.payload.manifest = hexToBytes("0x0e4f031e9e01012f064e504953410fff030eae03ce0cae16ce21ae2c8e30ce3bae4cae57de629e6eee7cce9701dea6015f0300068e01636f6e7374616e742f06367536343078303330325f0310169e0101636f6e7374616e742f0666737472696e6730783036376136353732366632303631363436343732363537333733323036363666373232303733363536653634363537325f0310169e0102636f6e7374616e742f0666737472696e673078303637613635373236663230363136343634373236353733373332303636366637323230373236353633363536393736363537325f0310169e0103636f6e7374616e742f0666737472696e673078303636393665373337353636363636393633363936353665373432303632363136633631366536333635323036363666373232303733363536653634363537325f0310169e0104636f6e7374616e742f0666737472696e6730783036363936653733373536363636363936333639363536653734323036323631366336313665363336353230363636663732323036323735373236655f031016860105747970656465666d61705b616464726573735d753235364f0310166e0673746174653f06ae0170657273697374656e745f0e8e02fe033f03066673796d626f6c737472696e673f03167601737570706c79753235364f031696010262616c616e6365736d61705b616464726573735d753235365f031e46be01071f0306726f7574696e65cf01066686028e03be07ce07ee0c53656564657270657273697374656e746465706c6f7965723f0e8e023f03066673796d626f6c737472696e673f03167601737570706c79753235360f5f06c604c0048000000401003000018100800001040101300001810080000273024902025c00020181000f5f031e46be01081f0306726f7574696e65cf010666e601fe028e03ae058e0753796d626f6c726561646f6e6c79696e766f6b61626c650f1f0e3f03066673796d626f6c737472696e675f068601800180000005000082000f5f031e36ae01091f03726f7574696e65df0106860186029e03ae03ce05be07446563696d616c73726561646f6e6c79696e766f6b61626c650f1f0e4f03068601646563696d616c737536345f06960190011100001000000500000f5f031e46be010a1f0306726f7574696e65df0106b601b602ce03de03de05be07546f74616c537570706c79726561646f6e6c79696e766f6b61626c650f1f0e3f030666737570706c79753235365f068601800180000105000082000f5f031e46be010b1f0306726f7574696e65df010696019602ae03ee05fe07ce0a42616c616e63654f66726561646f6e6c79696e766f6b61626c651f0e3f03067661646472657373616464726573731f0e3f03067662616c616e6365753235365f06f601f0018000020401005e01000105010082000f6f031ea6019e020c4f0313233301020306726f7574696e65df01068601a602be03ae08be08ee155472616e7366657270657273697374656e74696e766f6b61626c653f0ece024f030686017265636569766572616464726573733f03167601616d6f756e74753235360f5f06d60cd00c73004900004701001102080302011101011001014101010401004702011103100303021102021002024102018002025e0302003003030404014405030462050511061c030605110503100505410501660303045c0200035e000201650000045c02010081020f5f031e46be010d1f0306726f7574696e65cf010646e601fe02fe048e059e0b4d696e7470657273697374656e74696e766f6b61626c651f0e3f030666616d6f756e74753235360f5f06b605b00573004900008001013102010403006502020330010281018001025e020100040300650202035c01000281010f5f031e66de010e2f03130406726f7574696e65cf010646e601fe02fe048e05de0e4275726e70657273697374656e74696e766f6b61626c651f0e3f030666616d6f756e74753235360f5f06f608f00873004900008001025e0201003002020403004404020362040411050d030504110404100404410401660202035c01000281018000013101000402006602010224010230000181000f");
                const response = await this.signer.sendInteraction(params);
                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            default:
                break;
        }
        ErrorUtils.throwError('Method "' + type + '" not supported.', ErrorCode.UNSUPPORTED_OPERATION);
    }
    /**
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    processArguments(ixObject, type, option) {
        const params = {
            type: this.getIxType(),
            payload: ixObject.createPayload(),
        };
        if (option.sender != null) {
            params.sender = option.sender;
        }
        else {
            if (this.signer?.isInitialized()) {
                params.sender = this.signer.getAddress();
            }
        }
        if (option.fuelPrice != null) {
            params.fuel_price = option.fuelPrice;
        }
        if (option.fuelLimit != null) {
            params.fuel_limit = option.fuelLimit;
        }
        return { type, params: { ...params, ...option } };
    }
    /**
     * Creates a logic interaction request object based on the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    createIxRequest(ixObject) {
        const unwrap = async () => {
            const ix = await ixObject.call();
            return await ix.result();
        };
        return {
            unwrap,
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateFuel: ixObject.estimateFuel.bind(ixObject)
        };
    }
    /**
     * Creates a logic interaction request object with the specified routine and arguments.
     *
     * @param {LogicManifest.Routine} routine - The routine for the logic interaction request.
     * @param {any[]} args - The arguments for the logic interaction request.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    createIxObject(routine, ...args) {
        const option = args.at(-1) && typeof args.at(-1) === "object" ? args.pop() : {};
        const ixObject = {
            routine: routine,
            arguments: args
        };
        ixObject.call = async () => {
            return this.executeRoutine(ixObject, "call", option);
        };
        ixObject.send = async () => {
            option.fuelLimit = option.fuelLimit != null ? option.fuelLimit : await ixObject.estimateFuel();
            option.fuelPrice = option.fuelPrice != null ? option.fuelPrice : DEFAULT_FUEL_PRICE;
            return this.executeRoutine(ixObject, "send", option);
        };
        ixObject.estimateFuel = () => {
            return this.executeRoutine(ixObject, "estimate", option);
        };
        ixObject.createPayload = () => {
            return this.createPayload(ixObject);
        };
        return this.createIxRequest(ixObject);
    }
}
//# sourceMappingURL=logic-base.js.map