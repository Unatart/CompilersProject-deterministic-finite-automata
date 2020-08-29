function peek(stack:string[]) {
    return stack.length && stack[stack.length - 1];
}

type operators = "|" | "+" | "." | "*";

const operatorPrecedence = {
    '|': 0,
    '.': 1,
    '*': 2,
    '+': 0
};

export function toPostfix(exp:string) {
    let output = '';
    const operatorStack:string[] = [];

    for (const token of exp) {
        if (token === '.' || token === '|' || token === '*' || token === '+') {

            while (operatorStack.length && peek(operatorStack) !== '('
                && operatorPrecedence[peek(operatorStack) as operators] >= operatorPrecedence[token as operators]) {
                output += operatorStack.pop();
            }

            operatorStack.push(token);
        } else if (token === '(' || token === ')') {
            if (token === '(') {
                operatorStack.push(token);
            } else {
                while (peek(operatorStack) !== '(') {
                    output += operatorStack.pop();
                }
                operatorStack.pop();
            }
        } else {
            output += token;
        }
    }

    while (operatorStack.length) {
        output += operatorStack.pop();
    }

    return output;
}
