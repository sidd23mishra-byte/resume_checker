# training/train.py

import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import sentencepiece as spm
from pathlib import Path

from training.config import *
from training.dataset import LLMdataset
from models.word_transformer import WordTransformer


# =========================================================
# 0️⃣ Setup
# =========================================================

torch.backends.cudnn.benchmark = True
os.makedirs(MODEL_SAVE_PATH.parent, exist_ok=True)

DEVICE_TYPE = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", DEVICE)

# =========================================================
# 1️⃣ Load Tokenizer
# =========================================================

sp = spm.SentencePieceProcessor()
sp.load(str(SPM_MODEL_PATH))
vocab_size = sp.get_piece_size()

print("Vocab size:", vocab_size)

# =========================================================
# 2️⃣ Load Dataset
# =========================================================

train_dataset = LLMdataset(TRAIN_BIN_PATH)
val_dataset = LLMdataset(VAL_BIN_PATH)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    pin_memory=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    pin_memory=True
)

print("Train samples:", len(train_dataset))
print("Val samples:", len(val_dataset))

# =========================================================
# 3️⃣ Initialize Model
# =========================================================

model = WordTransformer(
    vocab_size=vocab_size,
    d_model=DMODEL,
    nhead=NHEAD,
    num_layers=NUM_LAYERS,
    dim_feedforward=DFF,
    dropout=DROPOUT,
    max_len=SEQ_LENGTH
).to(DEVICE)

print("Model parameters:", sum(p.numel() for p in model.parameters()))

# =========================================================
# 4️⃣ Optimizer, Loss, AMP
# =========================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)

criterion = nn.CrossEntropyLoss()

scaler = torch.amp.GradScaler(DEVICE_TYPE)

# =========================================================
# 5️⃣ Evaluation
# =========================================================

@torch.no_grad()
def evaluate():
    model.eval()
    total_loss = 0

    for X, Y in val_loader:
        X = X.to(DEVICE)
        Y = Y.to(DEVICE)

        with torch.amp.autocast(DEVICE_TYPE):
            logits = model(X)
            loss = criterion(
                logits.reshape(-1, vocab_size),
                Y.reshape(-1)
            )

        total_loss += loss.item()

    return total_loss / len(val_loader)

# =========================================================
# 6️⃣ Training Loop
# =========================================================

print("\n🚀 Starting training...\n")

for epoch in range(EPOCHS):

    model.train()
    total_loss = 0

    for batch_idx, (X, Y) in enumerate(train_loader):

        X = X.to(DEVICE)
        Y = Y.to(DEVICE)

        optimizer.zero_grad()

        with torch.amp.autocast(DEVICE_TYPE):
            logits = model(X)
            loss = criterion(
                logits.reshape(-1, vocab_size),
                Y.reshape(-1)
            )

        scaler.scale(loss).backward()

        # Gradient clipping
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), GRAD_CLIP)

        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item()

        if batch_idx % 50 == 0:
            print(f"Epoch {epoch+1} | Batch {batch_idx} | Loss {loss.item():.4f}")

    avg_train_loss = total_loss / len(train_loader)
    avg_val_loss = evaluate()

    print(f"\n📊 Epoch {epoch+1} Complete")
    print(f"Train Loss: {avg_train_loss:.4f}")
    print(f"Val Loss:   {avg_val_loss:.4f}")
    print("-" * 50)

    # Save checkpoint
    checkpoint_path = MODEL_SAVE_PATH.with_name(
        f"{MODEL_SAVE_PATH.stem}_epoch{epoch+1}.pt"
    )
    torch.save(model.state_dict(), checkpoint_path)
    print("✅ Checkpoint saved:", checkpoint_path)

# =========================================================
# 7️⃣ Save Final Model
# =========================================================

torch.save(model.state_dict(), MODEL_SAVE_PATH)

print("\n🎉 Final model saved to:", MODEL_SAVE_PATH)
print("Training complete.")