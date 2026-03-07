import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict, Any

# 載入環境變數
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)

LEVEL_CONTEXT = {
    1: "教學重點：Python 的 print() 函式。概念：字串需要用引號包起來，多個資料可以用逗號隔開。禁止使用：變數、f-string。",
    2: "教學重點：變數與資料型態 (int, str, float, bool)。概念：變數命名規則，用 type() 檢查型態。禁止使用：if, for。",
    3: "教學重點：數學運算 (+, -, *, /, //, %, **)。概念：整數除法與餘數的差別，次方的寫法。",
    4: "教學重點：邏輯判斷 (if, elif, else) 與比較運算子 (>, <, ==, !=)。概念：縮排 (Indentation) 的重要性，冒號 (:) 不能少。",
    5: "教學重點：迴圈 (for i in range, for i in string)。概念：重複執行的觀念，range() 的參數用法。"
}

# 暫存區：用來記錄不同學生的「專屬 AI 家教」與「目前的關卡」
# 格式: { "user_id": { "chat_session": ChatSession, "level": int } }
active_chats: Dict[str, Dict[str, Any]] = {}

def _init_chat_session(level: int, db_context: str = None) -> Any:
    """
    初始化一個新的 Gemini 對話，並把「絕對不變的設定」寫死在 System Instruction 裡 (只會吃一次)
    """
    current_focus = db_context if db_context else LEVEL_CONTEXT.get(level, "通用 Python 基礎")
    
    # 初始化時傳遞一次
    system_prompt = f"""
    你是一位針對兒童設計的 Python 程式設計家教，你的名字是「fundAi老師」。
    你的任務是陪伴孩子學習，引導他們自己發現錯誤，嚴禁直接給出完整的正確答案。
    
    【本關學習重點與限制】
    {current_focus}
    (請絕對不要教超過這個範圍的語法，避免學生混淆)

    請依照以下規則回應：
    1. 如果是語法錯誤，請指出錯誤位置並給個簡單範例。
    2. 如果是邏輯錯誤，請用提問的方式引導學生思考。
    3. 如果答對了，給予熱情的稱讚！
    4. 語氣要像在跟小學生說話，活潑親切。

    【強制輸出格式】
    你的每一次回覆都必須是純 JSON 格式，不要包含 ```json 標記：
    {{"dialogue": "你的回覆(繁體中文)", "emotion": "happy" 或 "sad" 或 "thinking" 或 "encouraging"}}
    """

    # 建立帶有 System Instruction 的模型
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        system_instruction=system_prompt
    )
    
    # 啟動對話 (回傳 ChatSession 物件)
    return model.start_chat(history=[])


def get_gemini_response(level: int, message: str = None, code: str = None, last_error: str = None, db_context: str = None, session_id: str = "demo_user"):
    """
    與 Gemini 進行輕量化對話。每次只傳遞最新的 Code 與學生的話。
    """
    if not api_key:
        return {"dialogue": "老師有點不舒服，請通知管理員檢查設定喔！", "emotion": "sad"}

    # 1. 檢查這個學生是不是第一次玩，或者「切換關卡了」
    # 如果換關卡，舊的對話紀錄與關卡限制就不適用了，必須重置 ChatSession
    if session_id not in active_chats or active_chats[session_id]["level"] != level:
        print(f"[{session_id}] 初始化/重置第 {level} 關的 AI 家教記憶體...")
        new_chat = _init_chat_session(level, db_context)
        active_chats[session_id] = {
            "chat_session": new_chat,
            "level": level
        }
    
    # 拿出該學生目前的專屬對話物件
    chat = active_chats[session_id]["chat_session"]

    # 2. 組裝這次要「餵」給 AI 的輕量化動態訊息
    user_prompt = ""
    
    if code:
        user_prompt += f"【學生剛剛寫的程式碼】\n```python\n{code}\n```\n"
        if last_error:
            user_prompt += f"【系統判題結果 / 錯誤訊息】\n{last_error}\n"
    
    if message:
        user_prompt += f"【學生的問題或對話】\n{message}\n"
        
    if not user_prompt:
        user_prompt = "學生進入了關卡，請跟他打個招呼！"

    # 3. 傳送訊息並取得回覆
    try:
        # 使用 chat.send_message 會自動將這次的對話加入歷史紀錄
        response = chat.send_message(user_prompt)
        
        # 清理字串並解析 JSON
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "dialogue": "哎呀，老師的腦袋突然打結了，可以再說一次嗎？",
            "emotion": "thinking"
        }