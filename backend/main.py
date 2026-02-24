from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 載入 .env 裡的金鑰到系統記憶體 (gemini推薦，但我們應該可以先放檔案裡)
load_dotenv()

# 初始化 FastAPI 應用程式
app = FastAPI(title="虛擬教室 API")

# 設定 CORS (允許你的網頁來串接)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 開發測試時先允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 寫一個最簡單的測試路由
@app.get("/api")
async def root():
    return {"message": "蔡老師說的我都OK"}

@app.get("/api/checkenv")
async def check_env():
    # 測試看看有沒有成功讀到 .env
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return {"status": "金鑰已載入 (為保護安全不顯示明文)"}
    return {"status": "警告：未找到金鑰"}