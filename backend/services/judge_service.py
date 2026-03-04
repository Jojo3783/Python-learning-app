import ast
import io
import sys
import multiprocessing
from contextlib import redirect_stdout
from typing import List, Dict, Any

class RequiredTokenVisitor(ast.NodeVisitor):
    def __init__(self):
        self.found_tokens = set()

    def visit_For(self, node):
        self.found_tokens.add('for')
        self.generic_visit(node)

    def visit_If(self, node):
        self.found_tokens.add('if')
        self.generic_visit(node)

    def visit_While(self, node):
        self.found_tokens.add('while')
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        self.found_tokens.add('def')
        self.generic_visit(node)

    def visit_Call(self, node):
        # 捕捉所有的函式呼叫，例如 'print', 'range', 'input', 'len' 等都會在這裡被收集
        if isinstance(node.func, ast.Name):
            self.found_tokens.add(node.func.id)
        self.generic_visit(node)


def _check_required_tokens(code: str, required_tokens: list) -> bool:
    if not required_tokens:
        return True
        
    try:
        tree = ast.parse(code)
        visitor = RequiredTokenVisitor()
        visitor.visit(tree)
        
        for token in required_tokens:
            if token not in visitor.found_tokens:
                return False
        return True
    except SyntaxError:
        return False


def _worker_process(code: str, test_input: str, queue: multiprocessing.Queue):
    """
    這是一個獨立的子進程，專門用來執行學生的程式碼。
    它與主要的 FastAPI 伺服器隔離，因此即使當機或無限迴圈，也不會影響主程式。
    """
    captured_output = io.StringIO()
    mock_input = io.StringIO(test_input)
    
    safe_globals = {"__builtins__": __builtins__}
    safe_locals = {}

    # 替換 stdin 與 stdout
    original_stdin = sys.stdin
    sys.stdin = mock_input

    try:
        with redirect_stdout(captured_output):
            exec(code, safe_globals, safe_locals)
        # 執行成功，將輸出結果放進 Queue 傳回給主進程
        queue.put({"status": "success", "output": captured_output.getvalue().strip()})
    except Exception as e:
        # 捕捉執行期錯誤
        error_type = type(e).__name__
        queue.put({"status": "error", "message": f"{error_type}: {str(e)}", "type": error_type})
    finally:
        sys.stdin = original_stdin


def check_code(user_code: str, test_cases: list, required_tokens: list = None, timeout_seconds: int = 2) -> Dict[str, Any]:
    """
    評估學生提交的程式碼 (包含防範無限迴圈的 Timeout 機制)。
    """
    result = {
        "is_correct": False,
        "pass_count": 0,
        "total_cases": len(test_cases) if test_cases else 0,
        "failed_case": None,
        "error_message": None,
        "feedback": ""
    }

    # 1. 檢查必備關鍵字 / 語法 (使用原本的 AST 邏輯)
    if required_tokens:
        if not _check_required_tokens(user_code, required_tokens):
            result["feedback"] = f"fundAi老師提醒：程式碼似乎缺少了這關必須使用的語法喔！ (需要包含: {', '.join(required_tokens)})"
            return result

    if not test_cases:
        result["is_correct"] = True
        result["feedback"] = "語法檢查通過！(無測資需要執行)"
        return result

    passed_cases = 0
    
    # 2. 逐一執行測資
    for i, case in enumerate(test_cases):
        expected_out = str(case.get("expected_output", ""))
        test_input = str(case.get("input", ""))

        # 建立一個 Queue 來接收子進程的回傳結果
        queue = multiprocessing.Queue()
        
        # 啟動子進程執行 _worker_process
        process = multiprocessing.Process(
            target=_worker_process, 
            args=(user_code, test_input, queue)
        )
        process.start()
        
        # 等待子進程結束，最多等待 timeout_seconds 秒
        process.join(timeout_seconds)

        # 檢查進程是否還活著 (代表超時了，陷入無限迴圈)
        if process.is_alive():
            process.terminate()  # 強制殺掉子進程
            process.join()       # 確保資源回收
            
            result["error_message"] = "TimeoutError: Execution timed out."
            result["feedback"] = f"fundAi老師發現程式執行太久了！是不是不小心寫成「無限迴圈」了呢？檢查一下迴圈的條件吧！"
            return result

        # 檢查 Queue 裡面有沒有結果 (處理一般錯誤或成功輸出)
        if not queue.empty():
            worker_result = queue.get()
            
            if worker_result["status"] == "error":
                error_type = worker_result["type"]
                result["error_message"] = worker_result["message"]
                result["feedback"] = f"fundAi老師在執行第 {i+1} 筆測資時發現了一個錯誤 ({error_type})，檢查一下程式碼吧！"
                return result
                
            elif worker_result["status"] == "success":
                output_str = worker_result["output"]
                
                # 比對輸出結果
                if output_str == expected_out.strip():
                    passed_cases += 1
                else:
                    result["failed_case"] = {
                        "case_number": i + 1,
                        "input": test_input,
                        "expected": expected_out,
                        "actual": output_str
                    }
                    result["feedback"] = f"在第 {i+1} 筆測資測試失敗囉。\n\n輸入：\n{test_input}\n\n預期輸出：\n{expected_out.strip()}\n\n你的輸出：\n{output_str}"
                    return result
        else:
            # 極端情況：進程死掉但 Queue 沒東西 (例如被系統強制 kill)
            result["error_message"] = "UnknownError: Process crashed unexpectedly."
            result["feedback"] = "程式發生未知的崩潰錯誤，請重新檢查語法。"
            return result

    # 3. 所有測資皆通過
    if passed_cases == len(test_cases):
        result["is_correct"] = True
        result["pass_count"] = passed_cases
        result["feedback"] = "太棒了！所有測資都正確通過！"

    return result