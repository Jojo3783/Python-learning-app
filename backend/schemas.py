from pydantic import BaseModel


# 定義新增與更新格式
class QuestionCAU(BaseModel):
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