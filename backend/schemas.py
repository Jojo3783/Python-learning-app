from pydantic import BaseModel
from typing import Optional

# 定義新增與更新格式
class QuestionCreate(BaseModel):
    level: int             
    content: str
    description : str            
    correct_answer: str     
    required_tokens : str

# 定義回傳格式(避免迴船答案)
class QuestionResponse(BaseModel):
  id: int
  level: int
  description: str
  content: str
    
  class Config:
    from_attributes = True

class QuestionAdminResponse(BaseModel):
  id: int
  level: int
  description: str
  content: str
  correct_answer: str  
  required_tokens: str

  class Config:
    from_attributes = True


class QuestionUpdate(BaseModel):
  level: int | None = None          
  content: str | None = None    
  description : str  | None = None        
  correct_answer: str | None = None
  required_tokens : str | None = None

class UserCreate(BaseModel):
  username: str
  password: str 

# 回傳給前端的資料
class UserResponse(BaseModel):
  id: int
  username: str
  current_level: int
  role: str
    
  class Config:
    from_attributes = True

class LevelUpdate(BaseModel):
  new_level: int

class RecordCreate(BaseModel):
  latest_code: str
  latest_error: str | None = None

class RecordResponse(BaseModel):
  id: int
  latest_code: str
  latest_error: str

  class Config:
    from_attributes = True 

class RecordUpdate(BaseModel):
  latest_code: str | None = None
  latest_error: str | None = None
