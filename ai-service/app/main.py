from fastapi import FastAPI
from app.api.routes import embedding_routes
from app.routes import router



app = FastAPI()

app.include_router(embedding_routes.router)
app.include_router(router)