import json
import ast
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from services.gemini_service import get_gemini_response
from services.judge_service import check_code
from models import Question, Record, User
from routers.user import get_current_user
from database import engine, Base, get_session, DBSession
from routers import question, user

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
# 記錄學生歷史紀錄進資料庫
# ==========================================

def get_db_session(db: DBSession, user_id: int) -> Dict[str, Any]:
    """從資料庫取得學生最後一次執行的狀態"""
    # 尋找該學生的紀錄
    record = db.query(Record).filter(Record.user_id == user_id).first()
    if record:
        return {"current_code": record.latest_code or "", "last_error": record.latest_error}
    return {"current_code": "", "last_error": None}

def update_db_session(db: DBSession, user_id: int, code: str, last_error: Optional[str] = None):
    """將學生的最新程式碼與錯誤報表寫入資料庫"""
    record = db.query(Record).filter(Record.user_id == user_id).first()
    if record:
        # 如果已有紀錄，直接更新
        record.latest_code = code
        record.latest_error = last_error
    else:
        # 如果是第一次執行，建立新紀錄
        new_record = Record(user_id=user_id, latest_code=code, latest_error=last_error)
        db.add(new_record)
    db.commit()

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
async def chat_with_tutor(
    request: ChatRequest, 
    db: DBSession,
    current_user: User = Depends(get_current_user)
):
    """
    與AI老師對話
    """
    # 1. 從 DB 撈出該關卡的限制與情境
    question_data = db.query(Question).filter(Question.level == request.level).first()
    db_context = question_data.description if question_data else "這是一個基礎的 Python 關卡。"
    
    # 2. 取得程式碼與歷史錯誤
    # 優先使用前端傳來的 code，沒有的話去暫存區找
    session_data = get_db_session(db, current_user.id)
    current_code = request.code if request.code else session_data["current_code"]
    last_error = session_data["last_error"]

    # 3. 呼叫服務
    ai_response = get_gemini_response(
        level=request.level,
        session_id=str(current_user.id),
        message=request.message,
        code=current_code,
        last_error=last_error,
        db_context=db_context,
    )
    
    return ai_response


@app.post("/api/submit")
async def submit_code(
    request: SubmitRequest, 
    db: DBSession,
    current_user: User = Depends(get_current_user)  # 🔒 強制綁定真實登入者
):
    """
    處理學生提交的程式碼，進行判題
    """
    question_data =     db.query(Question).filter(Question.level == request.level).first()
    
    if not question_data:
        raise HTTPException(status_code=404, detail="找不到該關卡資料")

    # --- 🌟 這裡開始是唯一要改的資料抓取邏輯 ---
    test_cases = []
    
    # 直接從關聯表抓資料，取代原本那一大段 json.loads
    if question_data.test_cases:
        for tc in question_data.test_cases:
            test_cases.append({
                "input": (str(tc.input) + "\n") if tc.input else "",
                "expected_output": str(tc.correct_answer).strip()
            })
    else:
        # 如果萬一 test_cases 是空的，給個防錯機制
        raise HTTPException(status_code=500, detail="此關卡尚未設定測資")
    # --- 🌟 修改結束 ---

    # 處理必備語法限制 (如 "print,for")
    req_tokens_str = question_data.required_tokens or ""
    required_tokens = [t.strip() for t in req_tokens_str.split(",") if t.strip()]

    # 送入沙盒進行判題
    result = check_code(
        user_code=request.code,
        test_cases=test_cases,
        required_tokens=required_tokens
    )

    if not result.get("is_correct"):
        error_msg = result.get("error_message") or result.get("feedback")
    else:
        error_msg = None

    # 將最新的程式碼與錯誤狀態更新到記憶體中
    update_db_session(
        db=db,
        user_id=current_user.id, 
        code=request.code, 
        last_error=error_msg
    )

    return result