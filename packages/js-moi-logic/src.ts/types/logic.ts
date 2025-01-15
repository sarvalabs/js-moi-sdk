import type { Element, ElementType, LogicState, RoutineType } from "js-moi-utils";
import type { RoutineOption } from "../routine-options";

export interface Routine {
    <TArgs extends [...any]>(...args: TArgs): Promise<unknown>;
    <TArgs extends [...any[], option: RoutineOption]>(...args: TArgs): Promise<unknown>;

    readonly name: string;

    readonly kind: RoutineType;

    readonly mode: LogicState;

    readonly accepts: Element<ElementType.Routine>["data"]["accepts"];

    readonly returns: Element<ElementType.Routine>["data"]["returns"];

    readonly catches: Element<ElementType.Routine>["data"]["catches"];
}
