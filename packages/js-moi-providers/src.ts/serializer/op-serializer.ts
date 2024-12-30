import { Polorizer, type Schema } from "js-polo";

export abstract class OperationSerializer {
    public abstract readonly type: number;

    public abstract readonly schema: Schema;

    public serialize(payload: any): Uint8Array {
        const polorizer = new Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}
