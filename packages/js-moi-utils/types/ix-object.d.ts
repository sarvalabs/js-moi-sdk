import type { OpType } from "../src.ts";
import type { Hex } from "./hex";

interface Account {
    address: Hex;
    sequence: number;
    key_id: number;
}

type Fund = {
    asset: Hex;
    label: string;
    type: string;
};

type LockType = {};

interface Operation {
    type: OpType;
    payload: any;
}

interface Participant {
    address: Hex;
    lock: LockType;
    notary: boolean;
}

interface Consensus {
    mtq: Hex;
    nodes: Hex[];
}

interface Preference {
    compute: Hex;
    consensus: Consensus;
}

export interface InteractionRequest {
    sender: Account;
    payer: Account;
    limit: number;
    tip: number;
    funds: Fund[];
    operations: Operation[];
    participants: Participant[];
    preferences: Preference;
    perception: Hex;
}
