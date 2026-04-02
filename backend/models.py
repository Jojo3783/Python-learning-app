from sqlalchemy import Column, Integer, String , ForeignKey , Float , DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Question(Base):
  __tablename__ = "questions"

  id = Column(Integer, primary_key=True, index=True)
  level = Column(Integer, unique=True, index=True)   # 關卡
  description = Column(String)  # 題目敘述
  content = Column(String)  # 題目                    
  required_tokens = Column(String, default="") # default: "print" or "for,range"
  category = Column(String , default = "school") # 填上題目類別
  sub_level = Column(String , default = "") # 你們可以填 1-1 這種的
  hint_level_1 = Column(String , default = "") # 提示1
  hint_level_2 = Column(String , default = "") # 提示2
  fill_blank_template = Column(String , default = "") # 不知道是啥，先填string
  persona_mode = Column(String , default = "")

  test_cases = relationship("TestCase", back_populates="question", cascade="all, delete-orphan")
  records = relationship("Record", back_populates="question", cascade="all, delete-orphan")

class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  username = Column(String, unique=True, index=True)
  hashed_password = Column(String) 
  current_level = Column(Integer, default = 1)
  role = Column(String, default="student")

  records = relationship("Record", back_populates="user", cascade="all, delete-orphan")
  chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
  submission_attempts = relationship("SubmissionAttempt", back_populates="user", cascade="all, delete-orphan")

class Record(Base):
  __tablename__ = "records"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  latest_code = Column(String)
  latest_error = Column(String, nullable=True)
  fail_count = Column(Integer , default = 0)
  question_id = Column(Integer, ForeignKey("questions.id"))
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

  user = relationship("User", back_populates="records")
  question = relationship("Question", back_populates="records")

class ChatHistory(Base):
  __tablename__ = "chat_history"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  chat_history = Column(String , default = "")
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
  level = Column(Integer , default = 1)
  user = relationship("User" , back_populates = "chat_history")

class SubmissionAttempt(Base):
  __tablename__ = "submission_attempts"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  result_status = Column(String, default="")
  error_type = Column(String, default="")
  execution_time_ms = Column(Float, default=0.0)
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
  memory_kb = Column(Float, default=0.0)
    
  user = relationship("User", back_populates="submission_attempts")

class TestCase(Base):
  __tablename__ = "test_cases"

  id = Column(Integer, primary_key=True, index=True)
  question_id = Column(Integer, ForeignKey("questions.id"))
  input = Column(String , default = "") # 輸入測資
  correct_answer = Column(String) # 答案
  question = relationship("Question", back_populates="test_cases")
