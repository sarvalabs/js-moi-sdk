import LogicManifest from "moi-abi/types/manifest";

export default class LogicDescriptor {
    protected logicId: string;
    protected manifest: LogicManifest.Manifest;
    protected engine: string;
    protected state: string;
    protected persistentStatePtr: number;
    protected ephemeralStatePtr: number;

    constructor(logicId: string, manifest: LogicManifest.Manifest) {
        this.logicId = logicId;
        this.manifest = manifest;

        this.setState();
        this.setEngine();
    }

    private setState = () => {
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

    private setEngine = () => {
        const engine: LogicManifest.EngineConfig = this.manifest.engine;
        this.engine = engine.kind;
    }

    public getLogicId = (): string => {
        return this.logicId
    }

    public getManifest = (): LogicManifest.Manifest => {
        return this.manifest;
    }

    public getEngine = (): string => {
        return this.engine;
    }

    public getState = (): string => {
        return this.state;
    }

    public getPersistentStatePtr = (): number | null => {
        if(this.persistentStatePtr !== undefined) {
            return this.persistentStatePtr;
        }

        return null;
    }

    public getEphemeralStatePtr = (): number | null => {
        if(this.ephemeralStatePtr !== undefined) {
            return this.ephemeralStatePtr;
        }

        return null;
    }
}
