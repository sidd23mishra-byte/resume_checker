# app/main_chat.py
import torch
import sys
from pathlib import Path
import sentencepiece as spm
import os
# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from models.word_transformer import WordTransformer
from .services.chat_service import generate_response as rule_based_response  # math & greeting engine

from training.config import *
# ==============================
# Load tokenizer
# ==============================
if not os.path.isfile(SPM_MODEL_PATH):
    raise FileNotFoundError(f"Tokenizer model not found at {SPM_MODEL_PATH}")

sp = spm.SentencePieceProcessor()
sp.load(str(SPM_MODEL_PATH))
vocab_size = sp.get_piece_size()
print(f"✅ Tokenizer loaded. Vocab size: {vocab_size}")

# ==============================
# Load GPT model
# ==============================
if not os.path.isfile(MODEL_SAVE_PATH):
    raise FileNotFoundError(f"Fine-tuned model not found at {MODEL_SAVE_PATH}")

model = WordTransformer(
    vocab_size=vocab_size,
    d_model=DMODEL,
    nhead=NHEAD,
    num_layers=NUM_LAYERS,
    dim_feedforward=DFF,
    dropout=DROPOUT,
    max_len=SEQ_LENGTH
).to(DEVICE)

checkpoint = torch.load(MODEL_SAVE_PATH, map_location=DEVICE)
model.load_state_dict(checkpoint)
model.eval()
print(f"✅ Model loaded from {MODEL_SAVE_PATH}")

# ==============================
# GPT Generation function
# ==============================
@torch.no_grad()
def generate_gpt(prompt: str, max_tokens: int = MAX_GEN_LENGTH, temperature: float = TEMPERATURE,
                 top_k: int = TOP_K, top_p: float = TOP_P, repetition_penalty: float = REPETITION_PENALTY):
    tokens = [sp.bos_id()] + sp.encode(prompt, out_type=int)
    tokens = tokens[-SEQ_LENGTH:]  # truncate
    input_ids = torch.tensor(tokens, dtype=torch.long, device=DEVICE).unsqueeze(0)
    generated = tokens.copy()

    for _ in range(max_tokens):
        input_ids_trim = input_ids[:, -SEQ_LENGTH:]
        logits = model(input_ids_trim)[0, -1, :]
        logits /= temperature

        # repetition penalty
        for token_id in set(generated):
            logits[token_id] /= repetition_penalty

        # top-k filtering
        if top_k > 0:
            topk_vals, topk_idx = torch.topk(logits, min(top_k, len(logits)))
            mask = torch.full_like(logits, float("-inf"))
            mask[topk_idx] = topk_vals
            logits = mask

        # top-p (nucleus) filtering
        if 0 < top_p < 1:
            sorted_logits, sorted_idx = torch.sort(logits, descending=True)
            probs = torch.softmax(sorted_logits, dim=-1)
            cumsum_probs = torch.cumsum(probs, dim=-1)
            cutoff = cumsum_probs > top_p
            cutoff[0] = False
            sorted_logits[cutoff] = float("-inf")
            logits[sorted_idx] = sorted_logits

        # sample next token
        probs = torch.softmax(logits, dim=-1)
        next_token = torch.multinomial(probs, 1).item()
        generated.append(next_token)

        if next_token == sp.eos_id():
            break

        input_ids = torch.tensor([generated], dtype=torch.long, device=DEVICE)

    decoded = sp.decode(generated[1:])  # remove BOS
    if "Bot:" in decoded:
        decoded = decoded.split("Bot:")[-1].strip()
    return decoded.strip()

# ==============================
# Combined chat function
# ==============================
def chat_with_bot(user_input: str) -> str:
    """
    Takes a user input string, returns a chatbot response string.
    Rule-based first, fallback to GPT.
    """
    # Rule-based first
    response = rule_based_response(user_input)
    if response != "I'm still learning. Can you explain that differently?":
        return response
    # Fallback to GPT
    return generate_gpt(user_input)