import asyncio
from fastapi import FastAPI, HTTPException, Depends # 確保有 Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from services.gemini_service import get_gemini_response
from services.judge_service import check_code
from models import Question
from database import engine, Base, get_session, DBSession
from routers import question , user

# 引入 Ethan 的路由
try:
    from routers import question
except ImportError:
    question = None

# 初始化資料庫表格 (如果還沒建表會自動建立)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="fundAi 老師 API - Python 虛擬教室")

# 設定 CORS (必須設定，否則前端 React Native / Expo 無法連線)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊 Ethan 負責的題目路由
if question:
    app.include_router(question.router)
    app.include_router(user.router)

# ==========================================
# 輕量級後端暫存區 (In-Memory Session Cache)
# 負責記住學生最後一次執行的程式碼與系統報錯
# ==========================================
student_sessions: Dict[str, Dict[str, Any]] = {}

def get_session(user_id: str = "demo_user") -> Dict[str, Any]:
    """取得學生的暫存狀態，若無則初始化"""
    if user_id not in student_sessions:
        student_sessions[user_id] = {"current_code": "", "last_error": None}
    return student_sessions[user_id]

def update_session(user_id: str, code: str, last_error: Optional[str] = None):
    """更新學生的程式碼與錯誤報表"""
    if user_id not in student_sessions:
        student_sessions[user_id] = {}
    student_sessions[user_id]["current_code"] = code
    student_sessions[user_id]["last_error"] = last_error


# ==========================================
# API 請求 Schema 定義 
# ==========================================
class ChatRequest(BaseModel):
    level: int
    message: Optional[str] = None
    code: Optional[str] = None

class SubmitRequest(BaseModel):
    level: int
    code: str


# ==========================================
# 核心 API 路由
# ==========================================

@app.post("/api/chat")
async def chat_with_tutor(request: ChatRequest, db: DBSession):
    """
    處理前端與 fundAi 老師的對話
    """
    # 1. 從 DB 撈出該關卡的限制與情境
    question_data = db.query(Question).filter(Question.level == request.level).first()
    db_context = question_data.description if question_data else "這是一個基礎的 Python 關卡。"
    
    # 2. 取得程式碼與歷史錯誤
    # 優先使用前端這次傳來的 code，沒有的話去暫存區找
    session_data = get_session("demo_user")
    current_code = request.code if request.code else session_data["current_code"]
    last_error = session_data["last_error"]

    # 3. 呼叫服務
    ai_response = get_gemini_response(
        level=request.level,
        message=request.message,
        code=current_code,
        last_error=last_error,
        db_context=db_context,
        session_id="demo_user"  # Demo 階段統一用這個，未來可換成真實 User ID
    )
    
    return ai_response


@app.post("/api/submit")
async def submit_code(request: SubmitRequest, db: DBSession):
    question_data = db.query(Question).filter(Question.level == request.level).first()
    
    if not question_data:
        raise HTTPException(status_code=404, detail="找不到該關卡資料")

    # --- 修改這裡：處理預期輸出 ---
    # 由於 db_init.py 存的是 "print('Hello World!')"
    # 我們需要提取出括號內的內容作為真正的「預期輸出」
    expected_out = question_data.correct_answer
    
    if "print('" in expected_out:
        # 簡單的提取邏輯：取得第一個 ' 到最後一個 ' 之間的內容
        import re
        match = re.search(r"'(.*?)'", expected_out)
        if match:
            expected_out = match.group(1)
    # -----------------------------------

    test_cases = [{"input": "", "expected_output": expected_out}]
    
    req_tokens_str = question_data.required_tokens or ""
    required_tokens = [t.strip() for t in req_tokens_str.split(",") if t.strip()]

    result = check_code(
        user_code=request.code,
        test_cases=test_cases,
        required_tokens=required_tokens
    )
    
    return result