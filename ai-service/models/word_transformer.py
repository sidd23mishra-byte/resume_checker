import torch
import torch.nn as nn
import torch.nn.functional as F
import math


# ==============================
# GPT Transformer Block
# ==============================
class GPTBlock(nn.Module):
    def __init__(self, d_model, nhead, dim_feedforward, dropout=0.1):
        super().__init__()

        self.ln1 = nn.LayerNorm(d_model)
        self.attn = nn.MultiheadAttention(
            embed_dim=d_model,
            num_heads=nhead,
            dropout=dropout,
            batch_first=True
        )

        self.ln2 = nn.LayerNorm(d_model)

        self.mlp = nn.Sequential(
            nn.Linear(d_model, dim_feedforward),
            nn.GELU(),
            nn.Linear(dim_feedforward, d_model),
            nn.Dropout(dropout)
        )

        self.dropout = nn.Dropout(dropout)

    def forward(self, x, causal_mask):

        # Attention
        x_norm = self.ln1(x)
        attn_out, _ = self.attn(
            x_norm, x_norm, x_norm,
            attn_mask=causal_mask,
            need_weights=False
        )
        x = x + self.dropout(attn_out)

        # MLP
        x_norm = self.ln2(x)
        x = x + self.mlp(x_norm)

        return x


# ==============================
# GPT Model
# ==============================
class WordTransformer(nn.Module):
    def __init__(
        self,
        vocab_size,
        d_model=256,
        nhead=8,
        num_layers=4,
        dim_feedforward=1024,
        dropout=0.1,
        max_len=512
    ):
        super().__init__()

        self.d_model = d_model
        self.max_len = max_len

        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_len, d_model)

        self.dropout = nn.Dropout(dropout)

        self.blocks = nn.ModuleList([
            GPTBlock(d_model, nhead, dim_feedforward, dropout)
            for _ in range(num_layers)
        ])

        self.ln_f = nn.LayerNorm(d_model)

        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        self.lm_head.weight = self.token_embedding.weight  # weight tying

        self.apply(self._init_weights)

    def _init_weights(self, module):
        if isinstance(module, (nn.Linear, nn.Embedding)):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def generate_causal_mask(self, seq_len, device):
        return torch.triu(
            torch.full((seq_len, seq_len), float('-inf'), device=device),
            diagonal=1
        )

    def forward(self, x):
        B, L = x.size()

        if L > self.max_len:
            x = x[:, -self.max_len:]
            L = self.max_len

        positions = torch.arange(0, L, device=x.device).unsqueeze(0)

        x = self.token_embedding(x) * math.sqrt(self.d_model)
        x = x + self.position_embedding(positions)
        x = self.dropout(x)

        mask = self.generate_causal_mask(L, x.device)

        for block in self.blocks:
            x = block(x, mask)

        x = self.ln_f(x)
        logits = self.lm_head(x)

        return logits

    @torch.no_grad()
    def generate(self, input_ids, max_new_tokens=50, temperature=0.8, top_k=40):

        self.eval()
        generated = input_ids

        for _ in range(max_new_tokens):

            generated = generated[:, -self.max_len:]

            logits = self.forward(generated)
            logits = logits[:, -1, :] / temperature

            if top_k is not None:
                v, idx = torch.topk(logits, top_k)
                probs = F.softmax(v, dim=-1)
                next_token = idx.gather(-1, torch.multinomial(probs, 1))
            else:
                probs = F.softmax(logits, dim=-1)
                next_token = torch.multinomial(probs, 1)

            generated = torch.cat((generated, next_token), dim=1)

        return generated