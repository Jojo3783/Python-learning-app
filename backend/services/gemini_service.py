import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from typing import Dict, Any

# 載入環境變數
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# 初始化新版 SDK Client
# 新版 SDK 不再使用 genai.configure()，而是透過 Client 實例進行操作
client = genai.Client(api_key=api_key) if api_key else None

LEVEL_CONTEXT = {
    1: "教學重點：Python 的 print() 函式。概念：字串需要用引號包起來，多個資料可以用逗號隔開。禁止使用：變數、f-string。",
    2: "教學重點：變數與資料型態 (int, str, float, bool)。概念：變數命名規則，用 type() 檢查型態。禁止使用：if, for。",
    3: "教學重點：數學運算 (+, -, *, /, //, %, **)。概念：整數除法與餘數的差別，次方的寫法。",
    4: "教學重點：邏輯判斷 (if, elif, else) 與比較運算子 (>, <, ==, !=)。概念：縮排 (Indentation) 的重要性，冒號 (:) 不能少。",
    5: "教學重點：迴圈 (for i in range, for i in string)。概念：重複執行的觀念，range() 的參數用法。"
}

# 暫存區：用來記錄不同學生的「專屬 AI 家教」與「目前的關卡」
active_chats: Dict[str, Dict[str, Any]] = {}

def _init_chat_session(level: int, db_context: str = None, db_content: str = None) -> Any:
    """
    初始化一個新的 Gemini 對話 (新版 SDK 語法)
    """
    current_focus = db_context if db_context else LEVEL_CONTEXT.get(level, "通用 Python 基礎")
    current_question = db_content if db_content else "這是一道自由發揮的 Python 練習題。"
    
    # 定義系統提示詞 (System Instruction)
    system_prompt = f"""
    你是一位針對兒童設計的 Python 程式設計家教，你的名字是「fundAi老師」。
    你的任務是陪伴孩子學習，引導他們自己發現錯誤，嚴禁直接給出完整的正確答案。
    
    【本關題目內容】
    {current_question}
    (這是學生現在要解的題目，請根據這個題目內容來引導學生)
    
    【本關學習重點與限制】
    {current_focus}
    (請絕對不要教超過這個範圍的語法，避免學生混淆)

    請依照以下規則回應：
    1. 如果是語法錯誤，請指出錯誤位置並給個簡單範例。
    2. 如果是邏輯錯誤，請結合「本關題目內容」用提問的方式引導學生思考。
    3. 提醒：現在的測資可能包含 input() 輸入，如果學生忘記寫 input() 或型態轉換 (如 int)，請友善提醒他。
    4. 如果答對了，給予熱情的稱讚！
    5. 語氣要像在跟小學生說話，活潑親切。

    【強制輸出格式】
    你的每一次回覆都必須是純 JSON 格式，不要包含 ```json 標記：
    {{"dialogue": "你的回覆(繁體中文)", "emotion": "happy" 或 "sad" 或 "thinking" 或 "encouraging"}}
    """

    chat = client.chats.create(
        model='gemini-2.5-flash',
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
        ),
        history=[]
    )
    
    return chat


def get_gemini_response(level: int, session_id: str, message: str = None, code: str = None, last_error: str = None, db_context: str = None, db_content: str = None):
    """
    與 Gemini 進行輕量化對話。
    """
    if not client:
        return {"dialogue": "老師有點不舒服，請通知管理員檢查設定喔！", "emotion": "sad"}

    # 1. 檢查這個學生是不是第一次玩，或者「切換關卡了」
    if session_id not in active_chats or active_chats[session_id]["level"] != level:
        print(f"[{session_id}] 初始化/重置第 {level} 關的 AI 家教記憶體...")
        new_chat = _init_chat_session(level, db_context, db_content)
        active_chats[session_id] = {
            "chat_session": new_chat,
            "level": level
        }
    
    # 拿出該學生目前的對話物件
    chat = active_chats[session_id]["chat_session"]

    user_prompt = ""
    
    if code:
        user_prompt += f"【學生剛剛寫的程式碼】\n```python\n{code}\n```\n"
        if last_error:
            user_prompt += f"【系統判題結果 / 錯誤訊息】\n{last_error}\n"
    
    if message:
        user_prompt += f"【學生的問題或對話】\n{message}\n"
        
    if not user_prompt:
        user_prompt = "學生進入了關卡，請跟他打個招呼！"

    try:
        response = chat.send_message(user_prompt)
        
        # 清理並解析 JSON
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "dialogue": "哎呀，老師的腦袋突然打結了，可以再說一次嗎？",
            "emotion": "thinking"
        }