from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import settings

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    content: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_copilot(req: ChatRequest):
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return ChatResponse(content="Error: GEMINI_API_KEY is not configured.")
        
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key)
    
    langchain_messages = [
        SystemMessage(content="You are CogniFlow AI Copilot, a brilliant, concise, and helpful assistant integrated into an enterprise decision intelligence operating system. Keep your answers brief, professional, and directly related to business rules, analytics, compliance, or system operations.")
    ]
    
    for msg in req.messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))
            
    response = llm.invoke(langchain_messages)
    return ChatResponse(content=response.content)
