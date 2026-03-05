from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse
from .main_chat import chat_with_bot

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    reply = chat_with_bot(req.message)
    return ChatResponse(response=reply)