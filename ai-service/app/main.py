from fastapi import FastAPI
from app.api.routes import embedding_routes

app = FastAPI()

app.include_router(embedding_routes.router)