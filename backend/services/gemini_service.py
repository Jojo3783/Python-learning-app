# backend/services/gemini_service.py
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

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

def get_gemini_response(level: int, message: str = None, code: str = None):
    """
    專門負責呼叫 Gemini 的函式
    """
    if not api_key:
        print("Error: API Key is missing in .env")
        return {
            "dialogue": "老師有點不舒服，請通知管理員檢查設定喔！",
            "emotion": "uncomfortable"
        }

    model = genai.GenerativeModel('gemini-2.5-flash')

    current_focus = LEVEL_CONTEXT.get(level, "通用 Python 基礎")
    
    if code:
        prompt = f"""
        你是一位針對兒童設計的 Python 程式設計家教，你的名字是「fundAi老師」。
        學生目前正在進行第 {level} 關的學習。
        
        學生提交了以下程式碼：
        ```python
        {code}
        ```

        請依照以下步驟思考並回應：
        1. **語法檢查**：檢查程式碼是否有 Syntax Error（如缺括號、缺冒號、縮排錯誤、拼字錯誤）。
        2. **邏輯檢查**：程式碼是否符合本關要求？
        3. **教學引導 (最重要)**：
           - **如果是語法錯誤**：不要直接給正確程式碼！請指出錯誤的地方（例如：「你的 print 後面是不是少了一個括號？」），並給一個「類似的簡單範例」。
           - **如果是邏輯錯誤**：引導學生思考（例如：「你現在印出來的是 30，但題目要求的是 300，是不是哪裡少乘了 10？」）。
           - **如果正確**：給予熱情的稱讚，並強調他用對了哪個觀念。
        
        限制：
        - 回覆必須包含 JSON 格式：{{"dialogue": "你的回覆", "emotion": "happy/neutral/thinking/surprised"}}
        - 語氣要像在跟小學生說話，活潑親切。
        - **嚴禁**直接給出完整的正確答案，要讓學生自己改。
        """
    else:
        # 一般對話模式
        prompt = f"""
        你是一位針對兒童設計的 Python 程式設計家教「fundAi老師」。
        學生目前在第 {level} 關。
        【本關學習重點】：{current_focus}
        
        學生的問題："{message}"
        
        請依照以下規則回應：
        1. 如果學生問「怎麼寫」或「教我」，請**不要**直接給答案。
        2. 請解釋該語法的「結構」。例如學生問「怎麼寫迴圈」，你可以回：「迴圈就像是讓機器人重複做動作，我們要用 for ... in ... 的語法，像這樣：... (給一個簡單無關的範例)」。
        3. 確保你的解釋符合【本關學習重點】，不要講太深奧的觀念。
        
        限制：
        - 回覆必須包含 JSON 格式：{{"dialogue": "你的回覆", "emotion": "happy/neutral/thinking/surprised"}}
        - 語氣親切、鼓勵性強。
        """

    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
    except Exception as e:
        print(f"AI Error: {e}")
        # 回傳一個備用的安全回應，避免整個程式掛掉
        return {
            "dialogue": "哎呀，老師的腦袋突然打結了，可以再說一次嗎？",
            "emotion": "thinking"
        }