import numpy as np
import torch
from torch.utils.data import Dataset
from training.config import SEQ_LENGTH

class LLMdataset(Dataset):
    def __init__(self, bin_file):
        self.data = np.fromfile(bin_file, dtype=np.uint32)

    def __len__(self):
        return len(self.data) - SEQ_LENGTH

    def __getitem__(self, idx):
        x = self.data[idx:idx + SEQ_LENGTH]
        y = self.data[idx + 1:idx + SEQ_LENGTH + 1]

        return (
            torch.tensor(x, dtype=torch.long),
            torch.tensor(y, dtype=torch.long)
        )