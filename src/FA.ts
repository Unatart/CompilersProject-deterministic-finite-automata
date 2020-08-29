
interface ITransition {
    symbol: string;
    next_state: string;
}

interface IStackState {
    states: string[];
    transitions: Map<string, ITransition[]>;
    begin_state: string;
    end_state: string;
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

    public toDFA() {
        const nfa = this.getNFA();
        // новые состояния и переходы
        const Q = [this.e_closure([nfa.begin_state]).sort()];
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

        return [Q, D];
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

    private closure(state:IStackState) {
        console.log('*', Object.assign(state));
        const start_state = this.createState();
        const end_state = this.createState();

        this.createTransition(start_state, state.begin_state);
        this.createTransition(state.end_state, end_state);
        this.createTransition(start_state, end_state);
        this.createTransition(state.end_state, state.begin_state);
        this.stack.push({
            states: new Array(...this.states),
            transitions: new Map(this.transitions),
            begin_state: start_state,
            end_state: end_state
        });
    }

    private concat(begin:IStackState, end:IStackState) {
        console.log('.', Object.assign(begin), Object.assign(end));
        const start_of_concat = begin.end_state;
        const end_of_concat = end.begin_state;

        const transition = this.transitions.get(end_of_concat)!;
        this.transitions.delete(end_of_concat);
        this.transitions.set(start_of_concat, transition);
        this.states = this.states.filter((state) => state !== end_of_concat);
        this.stack.push({
            states: new Array(...this.states),
            transitions: new Map(this.transitions),
            begin_state: begin.begin_state,
            end_state: end.end_state
        });
    }

    private union(begin:IStackState, end:IStackState) {
        console.log('+', Object.assign(begin), Object.assign(end));
        // соединяем состояния в одну точку в начале и в конце
        const begin_left = begin.begin_state;
        const begin_right = begin.end_state;
        const end_left = end.begin_state;
        const end_right = end.end_state;

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
            end_state: new_states[1]
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
            end_state: next_state
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

    private alphabet = ["a", "b", "c", "0", "1"];
    private stack:IStackState[] = [];
    private epsilon = "eps";
    // состояния типо q1, q2, и т.д.
    private states:string[] = [];
    private transitions = new Map<string, ITransition[]>();
}

