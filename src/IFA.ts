
export interface ITransition {
    symbol: string;
    next_state: string;
}

export interface IFAState {
    states: string[];
    transitions: Map<string, ITransition[]>;
    begin_state: string;
    end_states: string[];
}

export interface IFA {
    getNFA():IFAState;
    getDFA():IFAState | null;
    getMinimized():IFAState | null;
    toDFA():void;
    minimize():void;
    check(some_string:string):boolean;
}
