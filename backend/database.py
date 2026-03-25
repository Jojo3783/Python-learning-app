# backend/database.py
import os
from sqlalchemy import create_engine
from typing import Annotated
from sqlalchemy.orm import declarative_base , Session
from fastapi import Depends
from dotenv import load_dotenv

# 不要問我///在幹嘛，官方講的，後面指的是在這個資料夾裡的classroom.db
load_dotenv()
# 與資料庫連線，把同一線程驗證關掉
db_url = os.getenv("DATABASE_URL")

Base = declarative_base()

engine = create_engine(db_url)

def get_session():
  with Session(engine) as session:
     yield session

DBSession = Annotated[Session, Depends(get_session)]