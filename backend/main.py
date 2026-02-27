# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# 選填用
from typing import Optional
# 這裡匯入服務
from services.gemini_service import get_gemini_response

app = FastAPI(title="虛擬教室 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    level: int = 1
    code: Optional[str] = None

@app.post("/api/chat")
async def chat_with_gemini(request: ChatRequest):
    try:
        # 呼叫 services 裡的函式
        result = get_gemini_response(request.message, request.level)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))