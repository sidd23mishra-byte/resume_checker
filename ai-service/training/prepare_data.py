# training/prepare_data.py

import os
import sentencepiece as spm
import numpy as np

from training.config import *

# ==============================
# Create required directories
# ==============================

os.makedirs(os.path.dirname(TOKEN_BIN_PATH), exist_ok=True)
os.makedirs(os.path.dirname(SPM_MODEL_PATH), exist_ok=True)

# ==============================
# 1️⃣ Train SentencePiece tokenizer
# ==============================

if not os.path.isfile(SPM_MODEL_PATH):
    print("Training tokenizer...")

    spm.SentencePieceTrainer.train(
        input=str(DATA_PATH),  # convert Path → string
        model_prefix=str(SPM_MODEL_PATH.with_suffix("")),  # remove .model safely
        vocab_size=VOCAB_SIZE,
        model_type="bpe",
        unk_id=0,
        bos_id=1,
        eos_id=2,
        pad_id=-1,
        character_coverage=1.0,
        shuffle_input_sentence=True,
        num_threads=4
    )

    print("✅ Tokenizer trained!")

# ==============================
# 2️⃣ Load tokenizer
# ==============================

print("Loading tokenizer...")
sp = spm.SentencePieceProcessor()
sp.load(str(SPM_MODEL_PATH))  # convert Path → string

print("Vocabulary size:", sp.get_piece_size())

# ==============================
# 3️⃣ Read dataset
# ==============================

with open(DATA_PATH, "r", encoding="utf-8") as f:
    lines = f.readlines()

tokens_list = []

for line in lines:
    line = line.strip()
    if not line:
        continue

    if ',' in line:
        inp, resp = line.split(',', 1)
        full_text = f"User: {inp.strip()} Bot: {resp.strip()}"
    else:
        full_text = line

    ids = [sp.bos_id()] + sp.encode(full_text, out_type=int) + [sp.eos_id()]
    tokens_list.extend(ids)

tokens = np.array(tokens_list, dtype=np.uint32)

# ==============================
# 4️⃣ Save tokens
# ==============================

tokens.tofile(str(TOKEN_BIN_PATH))
print(f"✅ Saved tokens: {TOKEN_BIN_PATH}")
print("Total tokens:", len(tokens))

# ==============================
# 5️⃣ Split train/val
# ==============================

split_idx = int(len(tokens) * 0.9)

train_tokens = tokens[:split_idx]
val_tokens = tokens[split_idx:]

train_tokens.tofile(str(TRAIN_BIN_PATH))
val_tokens.tofile(str(VAL_BIN_PATH))

print(f"Train tokens: {len(train_tokens)} -> {TRAIN_BIN_PATH}")
print(f"Val tokens: {len(val_tokens)} -> {VAL_BIN_PATH}")
print("✅ Data preparation complete!")