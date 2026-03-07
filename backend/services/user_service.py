from sqlalchemy.orm import Session
import bcrypt
import models, schemas

# 如何拿錯誤說明，
# 有了id，把user的資料從user資料庫篩出來，就可以使用那個物件 current_user.records，拿到他所有的錯誤資訊的list



# 將明碼變成亂碼
def password_hash(password: str) -> str:
  pwd_bytes = password.encode('utf-8')
  salt = bcrypt.gensalt()
  # 進行加密
  hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
  # 把位元組轉回字串，存進資料庫
  return hashed_bytes.decode('utf-8')

# 比對密碼是否正確
def verify_password(plain_password: str, hashed_password: str) -> bool:
  # 把它們都轉成位元組比對
  password_byte = plain_password.encode('utf-8')
  hashed_password_byte = hashed_password.encode('utf-8')
  # 呼叫 bcrypt 內建的比對功能
  return bcrypt.checkpw(password_byte, hashed_password_byte)

# 去資料庫找是否存在
def get_user(db: Session, username: str):
  return db.query(models.User).filter(models.User.username == username).first()

# 將密碼加密後，帳號一起存進資料庫
def register_user(db: Session, user_in: schemas.UserCreate):
  hashed_pwd = password_hash(user_in.password)
    
  new_user = models.User(
    username=user_in.username,
    hashed_password=hashed_pwd
  )
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return new_user

# 資料庫找人，並核對前端傳來的密碼跟資料庫裡的加密是否吻合
def auth_user(db: Session, username: str, password: str):
  user = get_user(db, username)
  if not user or not verify_password(password, user.hashed_password):
    return False # 找不到人，或是密碼比對失敗
  return user

def update_level(db: Session, user: models.User, new_level: int):
  # 直接把使用者的等級，替換成前端傳過來的那個數字
  user.current_level = new_level 
  db.commit()
  db.refresh(user)
  return user

def create_record(db: Session, record_in: schemas.RecordCreate, user_id: int):
  new_record = models.Record(
    latest_code= record_in.latest_code,
    latest_error= record_in.latest_error,
    user_id=user_id 
  )
  db.add(new_record)
  db.commit()
  db.refresh(new_record)
    
  return new_record

def get_my_record(user_id: int, db: Session):
  user = db.query(models.User).filter(models.User.id == user_id).first()
  return user.records

def update_record(db: Session, record_id: int, record_in: schemas.RecordUpdate, user_id: int):
  db_record = db.query(models.Record).filter(models.Record.id == record_id).first()
    
  if not db_record:
    return None
        
  if db_record.user_id != user_id:
    return "FORBIDDEN" 

  if record_in.latest_code is not None:
    db_record.latest_code = record_in.latest_code
        
  if record_in.latest_error is not None:
    db_record.latest_error = record_in.latest_error

  db.commit()
  db.refresh(db_record)
    
  return db_record

def delete_record(db:Session , record_id: int , user_id : int):
  db_record = db.query(models.Record).filter(models.Record.id == record_id).first()

  if not db_record:
    return None
  
  if db_record.user_id != user_id:
    return "FORBIDDEN" 
  
  db.delete(db_record)
  db.commit()

  return True