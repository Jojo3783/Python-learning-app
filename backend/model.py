from sqlalchemy import Column, Integer, String
from database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, unique=True, index=True)   # 關卡
    description = Column(String)  # 題目敘述
    content = Column(String)  # 題目                    
    correct_answer = Column(String) # 答案