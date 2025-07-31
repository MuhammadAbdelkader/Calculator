const buttons = document.querySelectorAll('button');
const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');

let expression = '';

// === Display Handling ===
function updateDisplay() {
  expressionDisplay.textContent = expression;

  try {
    validateExpression(expression);
    const result = evaluateExpression(expression);
    resultDisplay.textContent = result;
    resultDisplay.style.color = 'white';
  } catch {
    resultDisplay.textContent = '';
  }
}

// === Evaluation Logic ===
function evaluateExpression(expr) {
  const replaced = expr
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/%/g, '/100');

  // Handle expressions like: 9 * -5 → 9 * (-5)
  const safeExpr = replaced.replace(/([*/])\s*(-\d+(\.\d+)?)/g, '$1($2)');

  const result = Function(`"use strict"; return (${safeExpr})`)();

  if (result === Infinity || result === -Infinity) throw new Error('Cannot divide by 0');
  if (Number.isFinite(result)) return +parseFloat(result.toFixed(10));

  return '';
}

// === Expression Validation ===
function validateExpression(expr) {
  const replaced = expr
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/%/g, '/100');

  if (!replaced.trim()) throw new Error('Please enter an expression');
  if (/[^\d+\-*/().\s]/.test(replaced)) throw new Error('Invalid characters');
  if (/[%]\d/.test(expr)) throw new Error('Invalid use of %');
  if (/\(\)/.test(expr)) throw new Error('Empty parentheses');

  const open = (expr.match(/\(/g) || []).length;
  const close = (expr.match(/\)/g) || []).length;
  if (open !== close) throw new Error('Unbalanced parentheses');

  const cleanExpr = replaced.replace(/([*/])([+\-])(?=\d)/g, '$1$2');
  if (/([+\-*/.])\1+/.test(cleanExpr)) throw new Error('Repeated operators');
  if (/^[*/]/.test(replaced)) throw new Error('Expression cannot start with * or /');
  if (/[+\-*/.]$/.test(replaced)) throw new Error('Expression cannot end with an operator');
}

// === Input Handling ===
function appendValue(value) {
  const lastChar = expression.slice(-1);

  if (value === '.' && lastChar === '.') return;

  if (isOperator(value)) {
    if (isOperator(lastChar)) {
      if (['*', '/', '+', '-'].includes(lastChar) && value === '-') {
        expression += value;
      } else {
        return;
      }
    } else {
      expression += value;
    }
  } else if (value === '.' && (!expression || isOperator(lastChar))) {
    expression += '0.';
  } else if (value === '( )') {
    handleParenthesis();
    return;
  } else {
    expression += value;
  }

  updateDisplay();
}

function isOperator(char) {
  return ['+', '-', '−', '×', '÷', '*', '/', '%'].includes(char);
}

function handleParenthesis() {
  const openCount = (expression.match(/\(/g) || []).length;
  const closeCount = (expression.match(/\)/g) || []).length;

  if (openCount > closeCount) {
    expression += ')';
  } else {
    expression += /\d$/.test(expression) ? '×(' : '(';
  }

  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  expression = '';
  updateDisplay();
  resultDisplay.textContent = '';
}

function calculate() {
  try {
    validateExpression(expression);
    const result = evaluateExpression(expression);
    expression = result.toString();
    expressionDisplay.textContent = expression;
    resultDisplay.textContent = result;
    resultDisplay.style.color = 'white';
  } catch (err) {
    resultDisplay.textContent = err.message;
    resultDisplay.style.color = 'red';
  }
}

// === Button Events ===
buttons.forEach((button) => {
  const value = button.textContent;

  button.addEventListener('click', () => {
    if (button.classList.contains('number') || button.classList.contains('operator')) {
      appendValue(value);
    } else if (button.classList.contains('delete')) {
      deleteLast();
    } else if (button.classList.contains('ac')) {
      clearAll();
    } else if (button.classList.contains('equals')) {
      calculate();
    }
  });
});
