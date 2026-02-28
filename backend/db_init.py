from database import engine
from sqlalchemy.orm import Session
import models


models.Base.metadata.create_all(bind=engine)

q1 = models.Question(level = 1 , description ="在 Python 中，print() 是最常用來輸出的指令。透過調整參數與連接符號，我們可以精確控制文字顯示的格式。"
     , content = "看完了上面的觀念,現在輪到你實作了,請使用學到的觀念,印出Hello World!"
     , correct_answer = "print('Hello World!')" 
     , required_tokens = "print")
    

# 先檢查是不是已經有題目了，避免重複新增
with Session(engine) as db:
  if db.query(models.Question).count() == 0:
    print("資料庫是空的")
 

    db.add_all([q1])
    db.commit()
    
    print("成功新增初始題目")
  else:
    print("資料庫已經有題目")
