from fastapi import APIRouter , HTTPException
from typing import List
import models, schemas
from database import DBSession

router = APIRouter(prefix = "/api/questions" , tags = ["題目管理"])

@router.get("/" , response_model = List[schemas.QuestionAdminResponse])
def get_all_question(db: DBSession):
  questions = db.query(models.Question).all()
  return questions

@router.get("/{level}" , response_model= schemas.QuestionResponse)
def get_question(level : int , db : DBSession ):
  question = db.query(models.Question).filter(models.Question.level == level).first()
  if not question:
    raise HTTPException(status_code=404 , detail=f"找不到{level}關")
  return question

@router.post("/")
def create_question(input: schemas.QuestionCAU , db : DBSession):
  exsist = db.query(models.Question).filter(models.Question.level == input.level).first()
  if exsist:
    raise HTTPException(status_code=400, detail=f"第 {input.level} 關已經有題目")
  
  new_q = models.Question(
    level = input.level , 
    description = input.description , 
    content = input.content , 
    correct_answer = input.correct_answer ,
    required_tokens = input.required_tokens
  )
  db.add(new_q)
  db.commit()
  return {"message" : "新增成功"}

@router.put("/{id}")
def update_question(input: schemas.QuestionCAU , db : DBSession):
  question = db.query(models.Question).filter(models.Question.id == input.id).first()
  if not question:
    raise HTTPException(status_code=404, detail="找不到題目可以更新")
  question.level = input.level
  question.description = input.description
  question.content = input.content
  question.correct_answer = input.correct_answer
  question.required_tokens = input.required_tokens
  db.commit()
  return {"message": "題目已成功更新"}

@router.delete("/{id}")
def delete_question(id:int , db: DBSession):
  target = db.query(models.Question).filter(models.Question.id == id).first()
  if not target:
    raise HTTPException(status_code=404 , detail="找不到題目可以刪除")
  db.delete(target)
  db.commit()
  return {"message" : "題目已成功刪除"}