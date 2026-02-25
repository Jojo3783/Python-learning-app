/*
--------使用方法---------
1. import { UseLevel } from '../hooks/use-level'; <-- 看你程式的資料夾，..代表回到上一個
   如果是(tabs)裡'../../hooks/use-level'
2. 取出各項 const { level, setLevel, resetLevel } = useLevel(); 小括號裡可以選填名字，預設叫level
3. level可得知目前進度，若要為level做更改請使用setLevel(這裡放數字)，呼叫resetLevel可以重設為1
p.s. setLevel算是一個物件，所以像是onclick後 必須寫成 () => setLevel(數字) 
    有問題再call我
*/
import { useState, useEffect } from 'react';

// 定義回傳的東東與資料型別
interface UseLevelReturn {
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  resetLevel: () => void;
}

// 呼叫這個function後的小括號可以選填，填了可以創建另一個進度
export function UseLevel(storageKey: string = 'level'): UseLevelReturn {

  const [level, setLevel] = useState<number>(() => {  // JS酷炫寫法，[level , setLevel] : level = [0] , setLevel = [1]
    // Lazy Initialization ， 只在第一次渲染讀取本機
    try {
      const savedLevel = localStorage.getItem(storageKey); // 從本機找level key
      return savedLevel ? parseInt(savedLevel, 10) : 1;
    } catch (error) {
      // 沒有存檔就從1開始
      console.error("讀取關卡失敗", error);
      return 1;
    }
  });

  // 重新渲染就執行，條件是level 與 storageKey有變才執行存檔
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, level.toString());
    } catch (error) {
      console.error("儲存關卡失敗", error);
    }
  }, [level, storageKey]);

  // 重製關卡，回歸一
  const resetLevel = () => {
    setLevel(1);
  };

  return { level, setLevel, resetLevel };
}