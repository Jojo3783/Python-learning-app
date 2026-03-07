# ====串接方法====
# 1. register 你們應該會
# 2. login 有點麻煩
#    請先將帳密弄成這個模式 -> name:pass , 並且使用btoa(name:pass)幫我轉Base64編碼   
#    並在header幫我加上 "Authorization": `Basic ${btoa轉的東東}`  
#    推薦選填項 : 把(btoa轉的東東)存進localstorge
# 3. me 說明 : 在刷新網頁或重開機後，可以保持登入的檢查機制，因為刷新後從login拿到的level那些會被砍掉，
#    所以不要在登入就用這個，使用時機為進入網頁時就要，header幫我加上 "Authorization": `Basic ${btoa轉的東東}`
#    如果回應有問題，把localstorge裡的資料先砍掉，避免出錯。
# 4. update-level : new_level: int 把這個打包成json，就可以更新，也要在header加上那個東東
# 
# p.s. 如果先不像用localstorge，me可以不用使用，但要把btoa(name:pass)這個轉出來的東東放全域，有問題跟我講
# ============

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import schemas, models
from services import user_service 
from database import DBSession
from typing import List

router = APIRouter(prefix="/api/users", tags=["帳號管理 (Basic Auth)"])

security = HTTPBasic(auto_error=False) 

def get_current_user(credentials: HTTPBasicCredentials = Depends(security), db: DBSession = None):
  # 如果前端根本沒有送帳密過來
  if not credentials:
    raise HTTPException(
      status_code=401,
      detail="請先登入"
    )
    
  # 核對帳密是否正確
  user = user_service.auth_user(db, credentials.username, credentials.password)
    
  # 如果帳號不存在，或密碼打錯了
  if not user:
    raise HTTPException(
      status_code=401,
      detail="帳號或密碼錯誤"
    )
        
  # 驗證通過
  return user

# 註冊新帳號
@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: DBSession):
    # 檢查名字是否被用過了
  if user_service.get_user(db, user_in.username):
    raise HTTPException(status_code=400, detail="這個名字已經被註冊過了喔！")
    
  return user_service.register_user(db, user_in)

@router.post("/login", response_model=schemas.UserResponse)
def login(current_user: models.User = Depends(get_current_user)):
  return current_user


@router.get("/me", response_model=schemas.UserResponse)
def read_users(current_user: models.User = Depends(get_current_user)):
  return current_user

@router.put("/update-level", response_model=schemas.UserResponse)
def update_level(level: schemas.LevelUpdate , current_user: models.User = Depends(get_current_user), db: DBSession = None):
  updated_user = user_service.update_level(db, current_user, level.new_level)
  return updated_user

@router.post("/create-record", response_model=schemas.RecordResponse)
def create_record(input: schemas.RecordCreate , db: DBSession , current_user: models.User = Depends(get_current_user)):
  new_record = user_service.create_record(db , input , current_user.id)
  return new_record

@router.get("/get-record" , response_model = List[schemas.RecordResponse])
def get_record(db : DBSession , current_user: models.User = Depends(get_current_user)):
  record = user_service.get_my_record(current_user , db)
  return record

@router.put("/{record_id}" , response_model = schemas.RecordResponse)
def update_record(db : DBSession  , record_id : int , input: schemas.RecordUpdate , current_user:models.User = Depends(get_current_user)):
  update_record = user_service.update_record(db , record_id , input , current_user.id)

  if update_record is None:
    raise HTTPException(status_code=404, detail="找不到這筆紀錄")
    
  if update_record == "FORBIDDEN":
    raise HTTPException(status_code=403, detail="權限不足：你不能修改別人的紀錄！")
  return update_record

@router.delete("/{record_id}")
def delete_record(db : DBSession , record_id : int, current_user : models.User = Depends(get_current_user)):
  result = user_service.delete_record(db , record_id , current_user.id)

  if result is None:
    raise HTTPException(status_code=404, detail="找不到這筆紀錄")
  
  if result == "FORBIDDEN":
    raise HTTPException(status_code=403, detail="權限不足：你不能刪除別人的紀錄！")
  
  return {"message" : "刪除成功"}