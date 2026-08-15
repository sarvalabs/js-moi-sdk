"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorState = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const accessor_1 = require("./accessor");
const accessor_builder_1 = require("./accessor-builder");
const entity_builder_1 = require("./entity-builder");
/**
 * Represents actor state functionality for a logic element (`state actor:`
 * in the manifest - scoped per calling participant, not shared/global).
 * Does not support retrieval of actor state elements.
 */
class ActorState {
    logicId;
    provider;
    driver;
    constructor(asset, provider) {
        this.logicId = asset.getAssetId().hex();
        this.provider = provider;
        this.driver = asset;
    }
    /**
     * Returns an accessor builder for the specified slot.
     *
     * @param slot - The slot number.
     * @param createAccessorBuilder - The function to create the accessor builder.
     * @returns The accessor builder for the specified slot.
     */
    getBuilder(slot, createAccessorBuilder) {
        const entityBuilder = new entity_builder_1.EntityBuilder(slot, this.driver);
        createAccessorBuilder(entityBuilder);
        return entityBuilder.getSlotAccessorBuilder();
    }
    /**
     * Retrieves the value from the actor state.
     *
     * @param createAccessorBuilder - The function that creates the accessor builder.
     * @returns A promise that resolves to the retrieved value.
     * @throws An error if the actor state is not present or if the accessor builder is invalid.
     */
    async get(address, createAccessorBuilder) {
        const [ptr, hasActorState] = this.driver.hasActorState();
        if (!hasActorState) {
            js_moi_utils_1.ErrorUtils.throwError("Actor state is not present");
        }
        const builder = this.getBuilder(ptr, createAccessorBuilder);
        if (!accessor_builder_1.SlotAccessorBuilder.isSlotAccessorBuilder(builder)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid accessor builder", js_moi_utils_1.ErrorCode.ACTION_REJECTED, {
                expected: accessor_builder_1.SlotAccessorBuilder.name,
                got: typeof builder,
            });
        }
        const slot = (0, accessor_1.generateStorageKey)(builder.getBaseSlot(), builder.getAccessors());
        const result = await this.provider.getStorageAt(this.logicId, slot.hex(), address);
        const depolorizer = new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result));
        if (!(0, js_moi_manifest_1.isPrimitiveType)(builder.getStorageType())) {
            return depolorizer.depolorizeInteger();
        }
        const schema = js_moi_manifest_1.Schema.parseDataType(builder.getStorageType(), this.driver.getClassDefs(), this.driver.getElements());
        return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(result)).depolorize(schema);
    }
}
exports.ActorState = ActorState;
//# sourceMappingURL=actor-state.js.map