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


def _worker_process(code: str, test_cases: list, queue: multiprocessing.Queue):
    """
    優化版：單一子進程處理所有測資。
    只要遇到錯誤或輸出不符，就提早中斷並回傳結果 (Fail Fast)。
    """
    safe_globals = {"__builtins__": __builtins__}
    
    for i, case in enumerate(test_cases):
        test_input = str(case.get("input", ""))
        expected_out = str(case.get("expected_output", "")).strip()
        
        captured_output = io.StringIO()
        mock_input = io.StringIO(test_input)
        
        original_stdin = sys.stdin
        sys.stdin = mock_input
        # 每次執行都給一個全新的 local 環境，避免上一筆測資的變數殘留
        safe_locals = {} 
        
        try:
            with redirect_stdout(captured_output):
                exec(code, safe_globals, safe_locals)
                
            output_str = captured_output.getvalue().strip()
            
            # 檢查答案是否正確
            if output_str != expected_out:
                queue.put({
                    "status": "wrong_answer",
                    "case_index": i,
                    "input": test_input,
                    "expected": expected_out,
                    "actual": output_str
                })
                return  # 答錯了，直接結束進程
                
        except Exception as e:
            error_type = type(e).__name__
            queue.put({
                "status": "error", 
                "message": f"{error_type}: {str(e)}", 
                "type": error_type,
                "input": test_input
            })
            return  # 發生語法/執行期錯誤，直接結束進程
        finally:
            sys.stdin = original_stdin
            
    # 若順利跑完迴圈，代表全部通過
    queue.put({"status": "all_passed", "pass_count": len(test_cases)})


def check_code(user_code: str, test_cases: list, required_tokens: list = None, timeout_seconds: int = 3) -> Dict[str, Any]:
    """
    優化版：只啟動一個 Process 來批次處理所有測資。
    (timeout 時間稍微加長到 3 秒，因為要一次跑完多個測資)
    """
    result = {
        "is_correct": False,
        "pass_count": 0,
        "total_cases": len(test_cases) if test_cases else 0,
        "failed_case": None,
        "error_message": None,
        "feedback": ""
    }

    # 1. 檢查必備關鍵字 / 語法
    if required_tokens:
        if not _check_required_tokens(user_code, required_tokens):
            result["feedback"] = f"fundAi老師提醒：程式碼似乎缺少了這關必須使用的語法喔！ (需要包含: {', '.join(required_tokens)})"
            return result

    if not test_cases:
        result["is_correct"] = True
        result["feedback"] = "語法檢查通過！(無測資需要執行)"
        return result

    # 2. 啟動單一子進程執行所有測資
    queue = multiprocessing.Queue()
    process = multiprocessing.Process(
        target=_worker_process, 
        args=(user_code, test_cases, queue)
    )
    process.start()
    process.join(timeout_seconds)

    if process.is_alive():
        process.terminate()
        process.join()
        result["error_message"] = "TimeoutError: Execution timed out."
        result["feedback"] = "fundAi老師發現程式執行太久了！是不是不小心寫成「無限迴圈」了呢？"
        return result

    if not queue.empty():
        worker_result = queue.get()
        
        if worker_result["status"] == "error":
            clean_input = worker_result["input"].replace('\n', ' ').strip()
            result["error_message"] = worker_result["message"]
            result["feedback"] = f"fundAi老師發現錯誤：當測試輸入為 `{clean_input}` 時，發生了 {worker_result['type']} 錯誤。檢查一下你的程式碼吧！"
            
        elif worker_result["status"] == "wrong_answer":
            idx = worker_result["case_index"]
            clean_input = worker_result["input"].replace('\n', ' ').strip()
            result["failed_case"] = {
                "case_number": idx + 1,
                "input": clean_input,
                "expected": worker_result["expected"],
                "actual": worker_result["actual"]
            }
            actual_display = worker_result["actual"] if worker_result["actual"] else "(沒有任何輸出)"
            result["feedback"] = f"第 {idx+1} 組測資挑戰失敗囉！\n\n🔹 當輸入：\n{clean_input}\n\n🎯 預期要輸出：\n{worker_result['expected']}\n\n❌ 你的輸出是：\n{actual_display}"
            
        elif worker_result["status"] == "all_passed":
            result["is_correct"] = True
            result["pass_count"] = worker_result["pass_count"]
            result["feedback"] = "太棒了！所有測資都正確通過！"
    else:
        result["error_message"] = "UnknownError: Process crashed."
        result["feedback"] = "程式發生未知的崩潰錯誤，請重新檢查語法。"

    return result