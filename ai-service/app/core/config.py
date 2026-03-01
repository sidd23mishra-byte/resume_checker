import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MODEL_NAME: str = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/pretrained")
    
settings = Settings()