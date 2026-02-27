# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 不要問我///在幹嘛，官方講的，後面指的是在這個資料夾裡的classroom.db
db_url = "sqlite:///./classroom.db" 
# 與資料庫連線，把同一線程驗證關掉
engine = create_engine(db_url , connect_args={"check_same_thread": False})

DBSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()