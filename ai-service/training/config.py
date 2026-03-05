import os
import torch
from pathlib import Path

# ==============================
# PATH SETUP (CLEAN + SAFE)
# ==============================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# ==============================
# DATA PATHS
# ==============================

DATA_PATH = PROJECT_ROOT / "data/raw/chat_data.txt"

TOKEN_BIN_PATH = PROJECT_ROOT / "data/processed/tokens.bin"
TRAIN_BIN_PATH = PROJECT_ROOT / "data/processed/train.bin"
VAL_BIN_PATH = PROJECT_ROOT / "data/processed/val.bin"

# ==============================
# TOKENIZER
# ==============================

SPM_MODEL_PATH = PROJECT_ROOT / "models/tokenizer.model"
VOCAB_SIZE = 1500

# ==============================
# MODEL SAVE
# ==============================

MODEL_SAVE_PATH = PROJECT_ROOT / "models/fine_tuned/gpt_model.pt"

# ==============================
# DEVICE
# ==============================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==============================
# MODEL (Optimized for RTX 2050 4GB)
# ==============================

DMODEL = 192         # embedding size
NHEAD = 6            # attention heads
NUM_LAYERS = 3       # transformer blocks
DFF = 768            # feed forward dimension
DROPOUT = 0.1
SEQ_LENGTH = 128

# ==============================
# TRAINING
# ==============================

BATCH_SIZE = 8       # safe for 4GB VRAM
EPOCHS = 15
LEARNING_RATE = 3e-4
WEIGHT_DECAY = 0.01
GRAD_CLIP = 1.0

# ==============================
# GENERATION
# ==============================

MAX_GEN_LENGTH = 128  # max tokens to generate
TEMPERATURE = 0.8      # creativity vs focus
TOP_K = 50             # top-k sampling
TOP_P = 0.9            # top-p nucleus sampling
REPETITION_PENALTY = 1.2