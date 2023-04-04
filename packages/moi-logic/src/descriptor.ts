import ABICoder from "moi-abi";
import LogicManifest from "moi-abi/types/manifest";
import LogicId from "./logic_id"

export default class LogicDescriptor {
    protected logicId: LogicId;
    protected manifest: LogicManifest.Manifest;
    protected manifestHash: string;
    protected engine: string;
    protected state: string;
    protected persistentStatePtr: number;
    protected ephemeralStatePtr: number;

    constructor(logicId: string, manifest: LogicManifest.Manifest) {
        this.logicId = new LogicId(logicId);
        this.manifest = manifest;
        this.manifestHash = ABICoder.encodeABI(this.manifest);

        const engine: LogicManifest.EngineConfig = this.manifest.engine;
        this.engine = engine.kind;

        const stateElement: any = this.manifest.elements.find(element => 
            element.kind === "state"
        )

        switch(stateElement.data.kind) {
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

    public getLogicId = (): string => {
        return this.logicId.hex()
    }

    public getEngine = (): string => {
        return this.engine;
    }

    public getManifest = (): LogicManifest.Manifest => {
        return this.manifest;
    }

    public getManifestHash = (): string => {
        return this.manifestHash;
    }

    public getState = (): string => {
        return this.state;
    }

    public getPersistentState = (): [number, boolean] => {
        if(this.persistentStatePtr !== undefined) {
            return [this.persistentStatePtr, true];
        }

        return [0, false];
    }

    public getEphemeralState = (): [number, boolean] => {
        if(this.ephemeralStatePtr !== undefined) {
            return [this.ephemeralStatePtr, true];
        }

        return [0, false];
    }

    public allowsInteractions = () => {
        return this.logicId.isInteractive();
    }

    public isStateful = () => {
        return this.logicId.isStateful();
    }
}
