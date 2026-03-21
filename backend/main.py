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

    raw_correct_answer = question_data.correct_answer.strip()
    test_cases = []

    # 處理字典
    if raw_correct_answer.startswith("{") and raw_correct_answer.endswith("}"):
        try:
            # 優化 1：優先嘗試用標準 json 解析，將單引號替換為雙引號以增加容錯
            try:
                parsed_data = json.loads(raw_correct_answer.replace("'", '"'))
            except json.JSONDecodeError:
                # 若 JSON 解析失敗，作為備案使用 ast.literal_eval (兼容舊資料)
                parsed_data = ast.literal_eval(raw_correct_answer)
            
            # 優化 2：提取資料
            test_data_raw = parsed_data.get("test_data", [])
            answer_raw = parsed_data.get("answer", [])
            
            # 優化 3：如果資料庫裡存的陣列仍是「字串」格式，則再次進行安全解析
            if isinstance(test_data_raw, str):
                test_data_list = json.loads(test_data_raw.replace("'", '"')) if test_data_raw.startswith("[") else ast.literal_eval(test_data_raw)
            else:
                test_data_list = test_data_raw
                
            if isinstance(answer_raw, str):
                answer_list = json.loads(answer_raw.replace("'", '"')) if answer_raw.startswith("[") else ast.literal_eval(answer_raw)
            else:
                answer_list = answer_raw
            
            # 組合測資
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
                detail=f"測資格式解析失敗，請確認資料庫中 correct_answer 格式。錯誤訊息: {str(e)}"
            )
    else:
        # 處理純字串答案
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
    update_db_session(
        db=db,
        user_id=current_user.id, 
        code=request.code, 
        last_error=error_msg
    )

    return result