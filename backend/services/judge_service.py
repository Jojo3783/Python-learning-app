# backend/services/judge_service.py

import sys
import ast
import contextlib
from io import StringIO

def check_code(user_code: str, expected_output: str, required_tokens: list = None):

    result = {
        "passed": False,
        "message": "",
        "output": ""
    }

    # --- 1. Static analysis (檢查 Token) ---
    if required_tokens:
        try:
            tree = ast.parse(user_code)
            # 取得所有程式碼裡的變數與關鍵字
            found_names = {node.id for node in ast.walk(tree) if isinstance(node, ast.Name)}
            # 程式碼轉成字串檢查關鍵字
            
            # 檢查每一個規定的 token 是否存在
            for token in required_tokens:
                # 這裡做簡單的字串檢查，進階可以用 ast.NodeVisitor TODO:明天修
                if token not in user_code:
                    result["message"] = f"你有使用到 '{token}' 嗎？請再檢查一下題目要求喔！"
                    return result
        except SyntaxError:
            result["message"] = "程式碼語法有錯喔！請檢查括號或引號是否成對。"
            return result

    # --- 2. Dynamic execution (跑測資) ---
    capture = StringIO()
    
    try:
        # 使用 contextlib 將內容導向到 capture 變數
        with contextlib.redirect_stdout(capture):
            safe_globals = {"__builtins__": __builtins__} 
            exec(user_code, safe_globals)
        
        # Get program code output
        actual_output = capture.getvalue().strip()
        result["output"] = actual_output

        # --- 3. Compare answers ---
        # 將學生答案 normalize (去除換行與多餘空白) 跟標準答案比對
        if actual_output == expected_output.strip():
            result["passed"] = True
            result["message"] = "恭喜過關！你的程式碼執行正確！"
        else:
            result["message"] = "執行結果不正確喔，請看看下方的輸出與預期是否相符。"

    except Exception as e:
        result["message"] = f"執行時發生錯誤：{str(e)}"
    
    return result