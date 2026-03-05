# services/chat_service.py
import re
import ast
import operator
from typing import Optional

# --- math & greeting engine ---
OPERATORS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
             ast.Div: operator.truediv, ast.Pow: operator.pow, ast.Mod: operator.mod}

ALLOWED_NODES = (ast.Expression, ast.BinOp, ast.UnaryOp, ast.Constant,
                 ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow, ast.Mod, ast.USub)

GREETING_WORDS = ["hi","hello","hey","howdy","greetings","good morning","good afternoon","good evening"]

def is_greeting(text: str) -> bool:
    text = text.lower()
    return any(re.search(rf"\b{g}\b", text) for g in GREETING_WORDS)

def is_math_expression(text: str) -> bool:
    return bool(re.search(r"[0-9\+\-\*/\%\(\)\.]+", text))

def extract_math_expression(text: str) -> Optional[str]:
    match = re.search(r"[0-9\+\-\*/\%\(\)\.]+", text)
    return match.group() if match else None

def _eval(node):
    if isinstance(node, ast.Constant):
        return node.value
    elif isinstance(node, ast.BinOp):
        return OPERATORS[type(node.op)](_eval(node.left), _eval(node.right))
    elif isinstance(node, ast.UnaryOp):
        return -_eval(node.operand)
    else:
        raise ValueError("Invalid expression")

def solve_math_expression(expr: str) -> str:
    try:
        node = ast.parse(expr, mode="eval")
        for subnode in ast.walk(node):
            if not isinstance(subnode, ALLOWED_NODES):
                raise ValueError("Unsafe expression")
        return f"The answer is {_eval(node.body)}"
    except Exception:
        return "Sorry, I couldn't solve that."

def generate_response(user_input: str) -> str:
    user_input = user_input.strip()
    if is_greeting(user_input):
        return "Hello! 👋 How can I help you today?"
    if is_math_expression(user_input):
        expr = extract_math_expression(user_input)
        if expr:
            return solve_math_expression(expr)
        
    return "I'm still learning. Can you explain that differently?"