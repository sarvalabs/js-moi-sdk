import { ABICoder } from "moi-abi";
import LogicId from "./logic_id";
export default class LogicDescriptor {
    logicId;
    manifest;
    manifestHash;
    engine;
    state;
    persistentStatePtr;
    ephemeralStatePtr;
    constructor(logicId, manifest) {
        this.logicId = new LogicId(logicId);
        this.manifest = manifest;
        this.manifestHash = ABICoder.encodeABI(this.manifest);
        const engine = this.manifest.engine;
        this.engine = engine.kind;
        const stateElement = this.manifest.elements.find(element => element.kind === "state");
        switch (stateElement.data.kind) {
            case "persistent":
                this.state = "Persistent";
                this.persistentStatePtr = stateElement.ptr;
                break;
            case "ephemeral":
                this.state = "Ephemeral";
                this.ephemeralStatePtr = stateElement.ptr;
                break;
            default:
                break;
        }
    }
    getLogicId = () => {
        return this.logicId.hex();
    };
    getEngine = () => {
        return this.engine;
    };
    getManifest = () => {
        return this.manifest;
    };
    getManifestHash = () => {
        return this.manifestHash;
    };
    getState = () => {
        return this.state;
    };
    getPersistentState = () => {
        if (this.persistentStatePtr !== undefined) {
            return [this.persistentStatePtr, true];
        }
        return [0, false];
    };
    getEphemeralState = () => {
        if (this.ephemeralStatePtr !== undefined) {
            return [this.ephemeralStatePtr, true];
        }
        return [0, false];
    };
    allowsInteractions = () => {
        return this.logicId.isInteractive();
    };
    isStateful = () => {
        return this.logicId.isStateful();
    };
}
