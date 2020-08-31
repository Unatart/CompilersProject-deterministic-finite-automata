import React from 'react';
import './App.css';
import {FA} from "./FA";
import {toPostfix} from "./toPostfix";

interface IAppState {
  regex: string;
}

class App extends React.PureComponent<{}, IAppState> {
  state = {
    regex: ""
  };

  render() {
    return (
        <div className="common">
          <div>Insert regex:</div>
          <input type="text" onChange={this.handleChange}/>
          <button onClick={this.handleClick}>submit</button>
        </div>
    );
  }

  handleChange = (event:any) => {
    event.preventDefault();
    this.setState({ regex: event.target.value });
  }

  handleClick = (event:any) => {
    event.preventDefault();
    const regex_with_dots = this.insertExplicitConcatOperator(this.state.regex);
    const prefix_regex_with_dots = toPostfix(regex_with_dots);
    if (prefix_regex_with_dots) {
      console.log(prefix_regex_with_dots);
      const fa = new FA(prefix_regex_with_dots);

      console.log(fa.get());
      fa.toDFA();
      console.log(fa.get());
      fa.minimize();
    }
  }

  // Добавление . между закрывающей скобкой и символом a-z, двумя символами подряд, * и символом, закрывающейся и открывающейся скобкой
  private insertExplicitConcatOperator(regex:string) {
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
}

export default App;
