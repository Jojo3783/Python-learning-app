import React, {useState} from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, TouchableOpacity, ScrollView  } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const LEVELS = [
  { id: 1, description: `在 Python 中，print() 是最常用來輸出的指令。透過調整參數與連接符號，我們可以精確控制文字顯示的格式。

1. 基礎規則
字串 (str)：文字內容必須使用雙引號 "" 包起來，這樣程式才會把它當作文字。
逗號 (,)：當 print 內有好幾筆資料時，用逗號隔開，Python 會自動在資料之間補上一個「空格」。
加號 (+)：用於字串連接，會將文字直接黏在一起，中間「不會」產生空格。

2. 進階參數 (控制格式)
sep (分隔字元)
用途：控制字跟字（也就是前面提到的逗號）的間隔符號。
預設值：一個空格 (" ")。
end (結束字元)
用途：控制整行印完後要接什麼符號。
預設值：換行符號 (\n)。如果設定 end=""，則印完不會換行，下一行 print 會接著印在後面。
當我執行
print("Hello World", end="")
print("abc", "def"+"hahaha")
會輸出
Hello Worldabc defhahaha
你能完全理解嗎?
如果可以,可以嘗試做下面的題目或是再看一遍內容
如果不行或覺得很奇怪,可以先自己想一想,若想不出來可以問AI老師
`, question: `看完了上面的觀念,現在輪到你實作了,請使用學到的觀念,印出Hello World!
`},
  { id: 2, description: `在任何程式語言中,資料型態都是重要的觀念,在Python當中也不例外,變數可以儲存不同資料型態的資料,並且,不同的資料型態可以做不同的事,以下介紹4種基本的資料型態

1.整數(int)
定義:不帶小數點的數字
例子:3, 100, -7, 0
2.字串(str)
定義:文字內容，必須用引號包起來
例子:"Hello world"
3.布林值(bool)
定義:用於判斷真假，只有兩種值
例子:True, False
4.浮點數(float)
定義:帶有小數點的數字
例子:1.23, 0.01, -0.2,5.0

P.S若你對資料型態感興趣,可以使用type來檢查資料型態
print(type(30))   #輸出<class 'int'>
print(type("Hi")) #輸出<class 'str'>
print(type(30.0)) #輸出<class 'float'>
print(type(True)) #輸出<class 'bool'>
你能完全理解嗎?
如果可以,可以嘗試做下面的題目或是再看一遍內容
如果不行或覺得很奇怪,可以先自己想一想,若想不出來可以問AI老師
`, question: "看完了上面的觀念,現在輪到你實作了,請使用學到的觀念,先使用變數name, height,age來儲存你的英文名子,身高和年齡,並且使用print印出,你的英文名字是name, 今年age歲, 身高height公尺"},
  { id: 3, description: `+(加)
Ex 
print(1 + 2) #輸出3

-(減、負數)
Ex 
print(2 - 1)  #輸出1
print(-3 + 1) #輸出-2

*(乘)
Ex
print(2 * 4) #輸出8
print(0 * 1) #輸出0

%(取餘數)
被除數不能是0
Ex
print(4 % 3) #輸出1
print(6 % 3) #輸出0
print(4 % 0) #ZeroDivisionError

/(除)
計算後的值是浮點數,被除數不能是0
Ex
print(4/2) #輸出2.0
print(4/0) #ZeroDivisionError
print(4 / 3)#輸出1.333333333......

//(取商數)
被除數不能是0
Ex
print(4 // 3) #輸出1
print(6 // 3) #輸出2
print(4 // 0) #ZeroDivisionError

**(次方)
Ex
print(2**3) #輸出8
print(3**0) #輸出1

不知道你看完上面的觀念後是不是覺得這三個"/"、"%"、"//"很像以下有相同數字的例子
print(1/2)  #輸出0.5
print(1%2)  #輸出1
print(1//2) #輸出0
統整
"/"計算的結果可能會是浮點數,並且不會有餘數出現
"//"和"%"是計算後的商數及餘數,商數一定是整數

你能完全理解嗎?
如果可以,可以嘗試做下面的題目或是再看一遍內容
如果不行或覺得很奇怪,可以先自己想一想,若想不出來可以問AI老師`, question: "第3關的question"},
  { id: 4, description: "第4關的description", question: "第4關的question"},
  { id: 5, description: "第5關的description", question: "第5關的question"},
];

const CollapsibleBox = ({ title, content } : any) => {
  // 1. 這是開關：預設是 false (關起來)
  const [isOpen, setIsOpen] = useState(false);

  return (
      <View style={styles.collapsibleContainer}>
        {/* 2. 這是標題按鈕：點一下切換開關 */}
        <TouchableOpacity 
          style={styles.collapsibleHeader} 
          onPress={() => setIsOpen(!isOpen)} // !isOpen 代表「反過來」 (開變關，關變開)
        >
          {/* 這裡用三元運算子來決定箭頭方向 */}
          <Text style={styles.collapsibleTitle}>
            {isOpen ? '▼' : '▶'} {title}
          </Text>
        </TouchableOpacity>

        {/* 3. 這是內容：只有當 isOpen 為 true 時才畫出來 */}
        {isOpen && (
          <View style={styles.collapsibleContent}>
            <Text style={styles.contentText}>{content}</Text>
          </View>
        )}
      </View>
  );
};

export default function GameScreen() {
  const router = useRouter();
  const { targetLevelIndex } = useLocalSearchParams();

  const currentLevel = LEVELS[Number(targetLevelIndex)];

  const handleWin = () => {
    Alert.alert(`你完成了${currentLevel.id}關`);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.levelTitle}>第{currentLevel.id}關</Text>
        <CollapsibleBox 
        title="你需要知道的觀念"
        content={currentLevel.description}
        ></CollapsibleBox>

        <CollapsibleBox 
        title="問題描述"
        content={currentLevel.question}
        ></CollapsibleBox>

        <Button title="提交程式" onPress={handleWin} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 60, paddingHorizontal: 20 },
  levelTitle: { fontSize: 28, fontWeight: 'bold' },
  monsterName: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  collapsibleContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 10, // 上下留白
    overflow: 'hidden', // 讓圓角效果正常
  },
  
  // 標題區
  collapsibleHeader: {
    padding: 15,
    backgroundColor: '#ddd', // 標題顏色深一點
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // 內容區
  collapsibleContent: {
    padding: 15,
    backgroundColor: '#fff', // 內容背景白色
  },
  contentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20, // 行高，讓文字不要擠在一起
  },
});