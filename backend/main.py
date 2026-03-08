import ast
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from services.gemini_service import get_gemini_response
from services.judge_service import check_code
from models import Question
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
# 輕量級後端暫存區 (In-Memory Session Cache)
# 負責記住學生最後一次執行的程式碼與系統報錯
# ==========================================
student_sessions: Dict[str, Dict[str, Any]] = {}

def get_session(user_id: str) -> Dict[str, Any]:
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
    與AI老師對話
    """
    # 1. 從 DB 撈出該關卡的限制與情境
    question_data = db.query(Question).filter(Question.level == request.level).first()
    db_context = question_data.description if question_data else "這是一個基礎的 Python 關卡。"
    
    # 2. 取得程式碼與歷史錯誤
    # 優先使用前端傳來的 code，沒有的話去暫存區找
    session_data = get_session("demo_user") #TODO: DEMO_USER
    current_code = request.code if request.code else session_data["current_code"]
    last_error = session_data["last_error"]

    # 3. 呼叫服務
    ai_response = get_gemini_response(
        level=request.level,
        session_id="demo_user",  #TODO: DEMO_USER
        message=request.message,
        code=current_code,
        last_error=last_error,
        db_context=db_context,
    )
    
    return ai_response


@app.post("/api/submit")
async def submit_code(request: SubmitRequest, db: DBSession):
    """
    處理學生提交的程式碼，進行判題
    """
    question_data =     db.query(Question).filter(Question.level == request.level).first()
    
    if not question_data:
        raise HTTPException(status_code=404, detail="找不到該關卡資料")

    raw_correct_answer = question_data.correct_answer.strip()
    test_cases = []

    # 💡 判斷邏輯：如果是以 { 開頭並以 } 結尾，代表是 Level 7 那種字典測資
    if raw_correct_answer.startswith("{") and raw_correct_answer.endswith("}"):
        try:
            parsed_data = ast.literal_eval(raw_correct_answer)
            
            test_data_str = parsed_data.get("test_data", "[]")
            answer_str = parsed_data.get("answer", "[]")
            
            test_data_list = ast.literal_eval(test_data_str)
            answer_list = ast.literal_eval(answer_str)
            
            for inputs, expected_out in zip(test_data_list, answer_list):
                if isinstance(inputs, list):
                    input_str = " ".join(map(str, inputs)) + "\n"
                else:
                    input_str = str(inputs) + "\n"
                    
                test_cases.append({
                    "input": input_str,
                    "expected_output": str(expected_out)
                })
        except Exception as e:
            print(f"測資解析失敗: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"字典測資格式解析失敗。錯誤訊息: {str(e)}"
            )
    else:
        # 💡 如果不是 { } 包起來的，就全部視為純字串答案 (Level 1~6 適用)
        test_cases.append({
            "input": "",
            "expected_output": raw_correct_answer
        })

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
    update_session(
        user_id="demo_user",  #TODO: DEMO_USER
        code=request.code, 
        last_error=error_msg
    )

    return result