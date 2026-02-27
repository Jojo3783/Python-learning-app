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

def get_gemini_response(message: str, level: int):
    """
    專門負責呼叫 Gemini 的函式
    """
    if not api_key:
        raise Exception("API Key missing")

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    if code:
        prompt = f"""
        你是一位針對兒童設計的 Python 程式設計家教，你的名字是「fundAi老師」。
        學生目前正在進行第 {level} 關的學習。
        
        學生提交了以下程式碼：
        ```python
        {code}
        ```
        
        學生的問題或留言是："{message}"
        
        請遵守以下規則：
        1. 請仔細分析學生的程式碼。如果是錯誤的，請用「引導」的方式提示他哪裡錯了（例如語法錯誤、邏輯錯誤），不要直接給出完整答案。
        2. 如果程式碼正確，請給予大大的稱讚。
        3. 回覆必須簡短、親切、有鼓勵性（適合兒童）。
        4. **絕對必須**回傳純 JSON 格式，包含 "dialogue" 和 "emotion" (happy, neutral, thinking, surprised)。
        """
    else:
        # 一般對話模式
        prompt = f"""
        你是一位針對兒童設計的 Python 程式設計家教，你的名字是「fundAi老師」。
        學生目前正在進行第 {level} 關的學習。
        學生的輸入是："{message}"
        
        請遵守以下規則：
        1. 回覆必須簡短、親切、有鼓勵性。
        2. **絕對必須**回傳純 JSON 格式，包含 "dialogue" 和 "emotion" (happy, neutral, thinking, surprised)。
        """

    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
    except Exception as e:
        print(f"AI Error: {e}")
        # 回傳一個備用的安全回應，避免整個程式掛掉
        return {
            "dialogue": "老師剛剛有點忙，請再試一次。",
            "emotion": "thinking"
        }