from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import settings
import numpy as np


class EmbeddingService:
    def __init__(self):
        # Load model only once when service starts
        self.model = SentenceTransformer(settings.MODEL_NAME)

    def get_embedding(self, text: str) -> np.ndarray:
        """
        Convert text into embedding vector
        """
        if not text.strip():
            # avoid empty text
            return np.zeros((1, self.model.get_sentence_embedding_dimension()))
        
        # encode returns np.ndarray of shape (1, dim)
        embedding = self.model.encode([text], convert_to_numpy=True)
        return embedding

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity between two texts
        """
        if not text1.strip() or not text2.strip():
            return 0.0  # nothing to compare

        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)

        # cosine_similarity expects 2D arrays
        similarity = cosine_similarity(emb1, emb2)[0][0]

        # clamp similarity between 0 and 1 just in case
        similarity = max(0.0, min(1.0, float(similarity)))
        return similarity