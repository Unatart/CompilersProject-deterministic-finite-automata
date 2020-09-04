import React from 'react';
import './App.css';
import {FA, IFAState} from "./FA";
import {toPostfix} from "./toPostfix";

interface IAppState {
  regex: string;
  dfas: (IFAState | undefined)[];
  nfa: IFAState | undefined;
  polsk_with_dots: string | undefined;
  check_string: string;
  result_of_check: boolean | undefined;
}

interface IFlatTransition {
  key:string;
  next_state:string;
  symbol:string;
}

class App extends React.PureComponent<{}, IAppState> {
  state:IAppState = {
    regex: "",
    dfas: [],
    nfa: undefined,
    polsk_with_dots: undefined,
    check_string: "",
    result_of_check: undefined
  };

  render() {
    return (
        <div className="common">
          <div>Insert regex:</div>
          <input type="text" onChange={this.handleRegex}/>
          <button onClick={this.handleClick}>submit</button>
          {this.state.polsk_with_dots &&
            <div>
              <div>{this.state.polsk_with_dots}</div>
              <div> ----------------------------- </div>
            </div>
          }
          {this.state.dfas.map((state, i) => {
            const transitions:IFlatTransition[] = [];

            state?.transitions.forEach((transition, key) => {
              transition.forEach((q) => {
                transitions.push({key, symbol: q.symbol, next_state: q.next_state});
              });
            });

            return <div key={i}>
              <div>STATES: {state?.states.toString()}</div>
              <div>TRANSITIONS: {
                transitions.map((transition) =>
                    <p>{`${transition.key} - ${transition.symbol} - ${transition.next_state}`}</p>)}
              </div>
              <div>BEGIN STATE: {state?.begin_state}</div>
              <div>END STATES: {state?.end_states.toString()}</div>
              <div> ----------------------------- </div>
            </div>
          })}
          {this.state.nfa &&
            <div>
              <input type="text" onChange={this.handleCheckString}/>
              {this.state.check_string && <button onClick={this.handleCheck}>submit</button>}
              {this.state.result_of_check !== undefined && <div>Result: {"" + this.state.result_of_check}</div>}
            </div>
          }
        </div>
    );
  }

  handleRegex = (event:any) => {
    event.preventDefault();
    this.setState({ regex: event.target.value });
  }

  handleCheckString = (event:any) => {
    event.preventDefault();
    this.setState({ check_string: event.target.value });
  }

  handleCheck = (event:any) => {
    event.preventDefault();
    this.setState({ result_of_check: this.fa?.check(this.state.check_string) });
  }

  handleClick = (event:any) => {
    event.preventDefault();
    const regex_with_dots = insertExplicitConcatOperator(this.state.regex);
    const prefix_regex_with_dots = toPostfix(regex_with_dots);
    if (prefix_regex_with_dots) {
      this.fa = new FA(prefix_regex_with_dots);
      this.setState({ polsk_with_dots: prefix_regex_with_dots, nfa: this.fa.getNFA() });
      console.log(this.fa.getNFA());
      this.fa.toDFA();
      // @ts-ignore
      this.setState({ fa_state: this.state.dfas.push(this.fa.getDFA()) });
      console.log(this.fa.getDFA());
      this.fa.minimize();
      // @ts-ignore
      this.setState({ fa_state: this.state.dfas.push(this.fa.getMinimized()) });
      console.log(this.fa.getMinimized());
    }
  }

  private fa:FA | undefined;
}

// Добавление . между закрывающей скобкой и символом a-z, двумя символами подряд, * и символом, закрывающейся и открывающейся скобкой
export function insertExplicitConcatOperator(regex:string) {
  let output = [regex[0]];
  const dot = ".";

  for (let i = 1; i < regex.length; i++) {
    const current_symbol = regex[i];
    const last_symbol = output[output.length - 1];
    if (/^[\w.]+/.test(last_symbol) && /^[\w.]+/.test(current_symbol)) {
      output.push(dot, current_symbol);
      continue;
    }
    if (/^[\w.]+/.test(last_symbol) && current_symbol === "("){
      output.push(dot, current_symbol);
      continue;
    }
    if (last_symbol === ")" && (/^[\w.]+/.test(current_symbol) || current_symbol === "(")) {
      output.push(dot, current_symbol);
      continue;
    }
    if (last_symbol === "*" && /^[\w.]+/.test(current_symbol)) {
      output.push(dot, current_symbol);
      continue;
    }
    output.push(current_symbol);
  }

  return output.join("");
}

export default App;
