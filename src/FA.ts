
interface ITransition {
    symbol: string;
    next_state: string;
}

export interface IFAState {
    states: string[];
    transitions: Map<string, ITransition[]>;
    begin_state: string;
    end_states: string[];
}

export class FA {
    constructor(regex:string) {
        if (regex === '' || !regex) {
            this.fromSymbol();
        } else {
            for (const token of regex) {
                switch (token) {
                    case "*": {
                        this.closure(this.stack.pop()!);
                        break;
                    }
                    case "+": {
                        const end = this.stack.pop()!;
                        const begin = this.stack.pop()!;
                        this.union(begin, end);
                        break;
                    }
                    case ".": {
                        const end = this.stack.pop()!;
                        const begin = this.stack.pop()!;
                        this.concat(begin, end);
                        break;
                    }
                    default: {
                        this.fromSymbol(token);
                        break;
                    }
                }
            }
        }
    }

    public getNFA() {
        return this.stack[this.stack.length - 1];
    }

    public getDFA() {
        return this.dfa;
    }

    public getMinimized() {
        return this.minimized;
    }

    public check(some_string:string):boolean | undefined {
        let result = false;

        if (this.minimized) {
            const { begin_state, end_states, transitions } = this.minimized;
            const list_of_transitions = some_string.split("");
            let end_state:string | undefined;
            let current_state:string | undefined = begin_state;

            while (current_state) {
                const transitions_for_current = transitions.get(current_state);
                end_state = current_state;
                current_state = undefined;
                const symbol = list_of_transitions.shift();
                transitions_for_current?.forEach((q) => {
                    if (q.symbol === symbol) {
                        current_state = q.next_state;
                    }
                });
            }

            return (end_state && list_of_transitions.length === 0 && end_states.indexOf(end_state) !== -1) as boolean;
        }
    }

    public toDFA() {
        if (this.dfa) {
            return;
        }

        const nfa = this.getNFA();
        let begin_state = this.e_closure([nfa.begin_state]).sort();
        const Q = [begin_state];
        const D = new Map<string, ITransition[]>();
        let Q_dynamic = [...Q];

        console.log("started Q:", [...Q]);

        while (Q_dynamic.length !== 0) {
            const current_q = Q_dynamic[0];
            for (let i = 0; i < this.alphabet.length; i++) {
                const S = this.e_closure(this.move(current_q, this.alphabet[i])).sort();
                console.log(this.alphabet[i], [...S]);
                if (S.length) {
                    let push:boolean = true;
                    Q.forEach((value) => {
                        if (this.compare(value, S)) {
                            push = false;
                        }
                    });

                    if (push) {
                        console.log("PUSH", [...Q], [...S]);
                        Q.push(S);
                        Q_dynamic.push(S);
                    }
                    const R = current_q.join("");
                    const R_transitions = D.get(R);
                    R_transitions?.push({ symbol: this.alphabet[i], next_state: S.join("") });
                    D.set(R, R_transitions
                        ? R_transitions
                        : [{ symbol: this.alphabet[i], next_state: S.join("") }]
                    );
                }
            }
            Q_dynamic = Q_dynamic.filter((q) => !this.compare(q, current_q));
        }

        const new_states = Q.map((q) => q.join(""));
        this.dfa = {
            begin_state: begin_state.join(""),
            states: new_states,
            transitions: D,
            end_states: new_states.filter((q) => q.includes(this.stack[this.stack.length - 1].end_states[0]))
        };
    }


    // not tested
    public minimize() {
        const p0 = this.dfa?.states.filter((q) => this.dfa?.end_states.indexOf(q) !== -1);
        const p1 = this.dfa?.states.filter((q) => this.dfa?.end_states.indexOf(q) === -1);
        let partition = [p0, p1];
        let nextP = [p0, p1];
        let worklist = [p0, p1];

        while (worklist.length !== 0) {
            const s:string[] = worklist[0]!;
            worklist.shift();
            for (let i = 0; i < this.alphabet.length; i++) {
                // Image ← {x | δ(x,c) ∈ s}
                const image:string[] = [];
                this.dfa?.transitions.forEach((transition, key) => {
                    transition.forEach((q) => {
                        if (q.symbol === this.alphabet[i] && s.indexOf(q.next_state) !== -1) {
                            image.push(key);
                        }
                    })
                });

                partition.forEach((q) => {
                    if (q) {
                        const q1 = q.filter((current_q) => image.indexOf(current_q) !== -1);
                        const q2 = q.filter((current_q) => q1?.indexOf(current_q) === -1);

                        if (q1.length !== 0 && q2.length !== 0) {
                            partition = partition.filter((state) => state && !this.compare(state, q));
                            nextP = nextP.filter((state) => state && !this.compare(state, q));

                            nextP.push(q1, q2);

                            let is_q_in_worklist = false;
                            worklist.forEach((s) => {
                                if (this.compare(s!, q)) {
                                    is_q_in_worklist = true;
                                }
                            });
                            if (is_q_in_worklist) {
                                worklist.filter((s) => !this.compare(s!, q));
                                worklist.push(q1, q2);
                            } else if (q1.length <= q2.length) {
                                worklist.push(q1);
                            } else {
                                worklist.push(q2);
                            }

                            if (this.compare(s, q)) {
                                return;
                            }
                        }
                    }
                });

                partition = [...nextP];
            }
        }

        const new_transitions = new Map<string, ITransition[]>();
        const new_states:string[] = [];

        partition.forEach((new_state) => {
            if (new_state) {
                const new_state_str = new_state.join("");

                new_states.push(new_state_str);

                if (new_state.length === 1) {
                    const old_transition = this.dfa?.transitions.get(new_state_str);
                    if (old_transition) {
                        new_transitions.set(new_state_str, old_transition);
                    }
                } else {
                    const started_transition:ITransition[] = [];

                    new_state.forEach((old_state) => {
                        // поиск стейтов которые начинаются на old_state
                        this.dfa?.transitions.forEach((transition, key) => {
                            let same:boolean = false;
                            started_transition.find((t) => {
                                transition.forEach((q) => {
                                    if (q.symbol === t.symbol && q.next_state === t.next_state) {
                                        same = true;
                                    }
                                })
                            });
                            if (key === old_state && !same) {
                                started_transition.push(...transition);
                            }
                        });
                    });

                    if (started_transition.length !== 0) {
                        new_transitions.set(new_state_str, started_transition);
                    }
                }
            }
        });


        const new_transitions_with_right_ends = new Map<string, ITransition[]>();
        new_transitions.forEach((transition, key) => {
            let new_transition:ITransition[] = [];

            transition.forEach((q) => {
                if (new_states.indexOf(q.next_state) !== -1) {
                    new_transition.push(q);
                } else {
                    let new_state:string | undefined;

                    partition.forEach((part) => {
                        if (part && part.indexOf(q.next_state) !== -1) {
                            new_state = part.join("");
                            return;
                        }
                    });

                    if (new_state) {
                        new_transition.push({ symbol: q.symbol, next_state: new_state });
                    }
                }
            });

            new_transitions_with_right_ends.set(key, new_transition);
        });

        let begin_state:string | undefined;
        const end_states:string[] = [];
        if (new_states.indexOf(this.dfa!.begin_state) !== -1) {
            begin_state = this.dfa!.begin_state;
        } else {
            partition.forEach((part) => {
                if (part && part.indexOf(this.dfa!.begin_state) !== -1) {
                    begin_state = part.join("");
                    return;
                }
            });
        }

        console.log("partition", partition);
        this.dfa!.end_states.forEach((end_state) => {
            if (new_states.indexOf(end_state) !== -1) {
                end_states.push(end_state);
            } else {
                partition.forEach((part) => {
                    const crossing = this.dfa?.end_states.filter((current_q) => part && part.indexOf(current_q) !== -1);
                    if (part && crossing?.length && end_states.indexOf(part.join("")) === -1) {
                        end_states.push(part.join(""));
                        return;
                    }
                });
            }
        });

        this.minimized = {
            begin_state: begin_state!,
            end_states: end_states,
            transitions: new_transitions_with_right_ends,
            states: new_states
        };
    }

    private move(states:string[], a:string):string[] {
        const result:string[] = [];

        states.forEach((current_state) => {
            const transitions = this.transitions.get(current_state);
            transitions?.forEach((value) => {
                if (value.symbol === a) {
                    result.push(value.next_state);
                }
            });
        });

        return result;
    }

    private e_closure(states:string[]):string[] {
        const result = [...states];

        let states_for_detour = [...states];
        states_for_detour.forEach((current_state) => {
            const transitions = this.transitions.get(current_state);
            transitions?.forEach((value) => {
                if (value.symbol === this.epsilon) {
                    result.push(value.next_state);
                    states_for_detour.push(value.next_state);
                }
            });
            states_for_detour = states_for_detour.filter((state) => state !== current_state);
        });

        return result;
    }

    private closure(state:IFAState) {
        console.log('*', Object.assign(state));
        const start_state = this.createState();
        const end_state = this.createState();

        this.createTransition(start_state, state.begin_state);
        this.createTransition(state.end_states[0], end_state);
        this.createTransition(start_state, end_state);
        this.createTransition(state.end_states[0], state.begin_state);
        this.stack.push({
            states: new Array(...this.states),
            transitions: new Map(this.transitions),
            begin_state: start_state,
            end_states: [end_state]
        });
    }

    private concat(begin:IFAState, end:IFAState) {
        console.log('.', Object.assign(begin), Object.assign(end));
        const start_of_concat = begin.end_states[0];
        const end_of_concat = end.begin_state;

        const transition = this.transitions.get(end_of_concat)!;
        this.transitions.delete(end_of_concat);
        this.transitions.set(start_of_concat, transition);
        this.states = this.states.filter((state) => state !== end_of_concat);
        this.stack.push({
            states: new Array(...this.states),
            transitions: new Map(this.transitions),
            begin_state: begin.begin_state,
            end_states: end.end_states
        });
    }

    private union(begin:IFAState, end:IFAState) {
        console.log('+', Object.assign(begin), Object.assign(end));
        // соединяем состояния в одну точку в начале и в конце
        const begin_left = begin.begin_state;
        const begin_right = begin.end_states[0];
        const end_left = end.begin_state;
        const end_right = end.end_states[0];

        const new_states = [`${begin_left}${end_left}`, `${begin_right}${end_right}`];

        const begin_left_transitions = begin.transitions.get(begin_left);
        const end_left_transitions = end.transitions.get(end_left);

        this.transitions.delete(begin_left);
        this.transitions.delete(end_left);

        this.transitions.set(new_states[0], [...begin_left_transitions!, ...end_left_transitions!]);

        const new_transitions = new Map();
        // @ts-ignore
        for (let [key, value] of this.transitions) {
            let new_value:ITransition[] = [];
            value?.map((transition:ITransition) => {
                if (transition.next_state === begin_right || transition.next_state === end_right) {
                    new_value.push({
                        symbol: transition.symbol,
                        next_state: new_states[1]
                    });
                } else {
                    new_value.push(transition);
                }
            });
            new_transitions.set(key, new_value);
        }
        this.transitions = new_transitions;
        this.states.push(...new_states);

        this.states = this.states.filter((state) => [begin_left, begin_right, end_left, end_right].indexOf(state) === -1);

        this.stack.push({
            states: new Array(...this.states),
            transitions: new Map(this.transitions),
            begin_state: new_states[0],
            end_states: [new_states[1]]
        });
    }

    private fromSymbol(symbol?:string) {
        const begin_state = this.createState();
        const next_state = this.createState();
        this.createTransition(begin_state, next_state, symbol);

        this.stack.push({
            states: new Array(...this.states),
            transitions: new Map(this.transitions),
            begin_state: begin_state,
            end_states: [next_state]
        });
    }

    private createState():string {
        let new_state = `q${this.states.length}`;
        if (this.states.indexOf(new_state) !== -1) {
            new_state = `q${this.states.length + this.states.length}`;
        }
        this.states.push(new_state);

        return new_state;
    }

    private createTransition(b_state:string, n_state:string, symbol?:string,) {
        let transitions_for_key = this.transitions.get(b_state);
        if (!transitions_for_key) {
            transitions_for_key = [{ symbol: symbol || this.epsilon, next_state: n_state }];
        } else {
            transitions_for_key.push({ symbol: symbol || this.epsilon, next_state: n_state });
        }
        this.transitions.set(b_state, transitions_for_key);

        return transitions_for_key;
    }

    private compare(arr1:any[], arr2:any[]) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        const array1 = arr1.sort();
        const array2 = arr2.sort();
        return array1.every(function(value, index) { return value === array2[index]});
    }


    private minimized:IFAState | null = null;
    private dfa:IFAState | null = null;
    private alphabet = ["a", "b", "c", "0", "1"];
    private stack:IFAState[] = [];
    private epsilon = "eps";
    // состояния типо q1, q2, и т.д.
    private states:string[] = [];
    private transitions = new Map<string, ITransition[]>();
}

