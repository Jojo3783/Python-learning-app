{/* todo list */}
// 點一個地方可以開一個新的頁面 可以跟ＡＩ communication (非即時，有cd時間，不是想問就問)
//程式碼送出以後會進入 新頁面（會出現AC WA等等，結果  還有AI 點出問題）（成功之後要鎖程式畫面）
import React, {useState,  useEffect} from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, TouchableOpacity, ScrollView, ActivityIndicator  } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useLevel } from '../hooks/use-level';


const API_BASE_URL = 'http://127.0.0.1:8000'; // 換成你電腦的真實 IP

// 設定你的 FastAPI 網址
export default function GameScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const { targetLevelIndex } = useLocalSearchParams();
  const realLevelId = Number(targetLevelIndex) + 1;
  const [questionData, setQuestionData] = useState<any>(null); // 用來存後端抓來的題目
  const [isLoading, setIsLoading] = useState(true); // 載入 state
  const [code, setCode] = useState('');
  // 用來記錄目前選中的是哪個頁籤，預設是 'description' (題目描述)
  const [activeTab, setActiveTab] = useState('description');
  const { level: currentProgress } = useLevel(); //get level
  
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/questions/${realLevelId}`);
        const data = await response.json();
        if (response.ok) {
          setQuestionData(data);
        } else {
          Alert.alert("錯誤", data.detail || "找不到題目");
        }
      } catch (error) {
        Alert.alert("連線失敗", "無法連接到伺服器，請確認 FastAPI 是否已啟動。");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestion();
  }, [realLevelId]);
  
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => {
            router.push({
              pathname: '/ChatScreen',
              params: { targetLevelIndex: targetLevelIndex }
            });
          }}
          style={{ 
            marginRight: 15, 
            backgroundColor: '#cab8a2', 
            paddingHorizontal: 12, 
            paddingVertical: 6, 
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#170c52', fontWeight: 'bold', fontSize: 14 }}>
             問老師
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, targetLevelIndex]);
const [localPassed, setLocalPassed] = useState(false);
const isPassed = currentProgress > realLevelId || localPassed;
const {setLevel} = useLevel()
const handleSubmit = async () => {
  if (!code.trim()) {
    window.alert("內容不能為空ㄛ");
    return;
  }

  setIsLoading(true);

  try {
    // 1. 發送請求
    const response = await fetch(`${API_BASE_URL}/api/submit`, {
      method: "POST", 
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${localStorage.getItem('userToken')}` 
    },
    body: JSON.stringify({
      level: currentProgress, 
      code: code,
   }),
  });

    const result = await response.json();

    if (result.is_correct) {
     
      window.alert("太棒了！" + result.feedback);

      setLocalPassed(true);
      const nextLevel = currentProgress + 1;
      setLevel(nextLevel); 
      
 
    } else {
      //  處理失敗邏輯 (語法錯誤、測資沒過等)
      alert(result.feedback);
    }
  } catch (error) {
    console.error("提交失敗:", error);
    alert("連線發生錯誤，請稍後再試。");
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>努力載入題目中...</Text>
      </View>
    );
  }

  if (!questionData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>找不到第 {questionData.level} 關的題目 😢</Text>
        <Text style={{ color: '#666' }}>請確認 FastAPI 有開啟，且資料庫裡有這關。</Text>
        <Button title="回上一頁" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/*左半邊*/}
      <View style={styles.leftPanel}>
        <View style={styles.tabBarContainer}>
          {/* 標籤 1：觀念提示 */}
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'hint' && styles.activeTabItem]} 
            onPress={() => setActiveTab('hint')}
          >
            <Text style={[styles.tabText, activeTab === 'hint' && styles.activeTabText]}>💡 觀念提示</Text>
          </TouchableOpacity>
          {/* 標籤 2：題目描述 */}
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'description' && styles.activeTabItem]} 
            onPress={() => setActiveTab('description')}
          >
            <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>📄 題目描述</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.contentContainer}>
        
          {/* 標題永遠顯示在最上面 */}
          <Text style={styles.levelTitle}>第 {realLevelId} 關</Text>

         {/* --- 當點擊「題目描述」時顯示 --- */}
          {activeTab === 'description' && (
            <ScrollView>
              {/* ✅ 改成吃後端的 content，如果後端沒資料就顯示提示文字 */}
              <Text style={styles.contentText}>
                {questionData ? questionData.content : "這關的題目還沒準備好喔！"}
              </Text>
            </ScrollView>
          )}

          {/* --- 當點擊「觀念提示」時顯示 --- */}
          {activeTab === 'hint' && (
            <ScrollView>
              {/* ✅ 改成吃後端的 description，如果後端沒資料就顯示提示文字 */}
              <Text style={styles.contentText}>
                {questionData ? questionData.description : "這關暫無提示！"}
              </Text>
            </ScrollView>
          )}
        </View>
      </View>


      {/*右半邊*/}
      <View style={styles.rightPanel}>
        
        <View style={styles.codeHeader}>
          <Text style={styles.codeTitle}>撰寫 Python Code</Text>
        </View>

        {/* 🌟 修改點 1：根據 isPassed 改變背景顏色 */}
        <View style={[styles.codeEditorContainer, isPassed && { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
          <TextInput
            // 🌟 修改點 2：根據 isPassed 改變文字顏色
            style={[styles.codeInput, isPassed && { color: '#666' }]} 
            multiline={true}
            // 🌟 修改點 3：根據 isPassed 改變提示文字
            placeholder={ (isPassed) ? "✅ 程式碼已鎖定 (AC)" : "請在此輸入 Python 程式碼..."}
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
            // 🌟 修改點 4：核心魔法！答對後不允許編輯
            editable={!isPassed} 
          />
        </View>
        
        {/* 🌟 修改點 5：把 onPress 換成 handleSubmit，並在過關後 disabled */}
        <Button 
          title={(isPassed) ? "已完成" : "送出批改"} 
          onPress={handleSubmit} 
          color={isPassed ? "#555" : "#4CAF50"} 
          disabled={(isPassed)}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',       // 讓按鈕橫向排列
    backgroundColor: '#1E1E1E', // 深色背景 (像 LeetCode 一樣)
    paddingHorizontal: 10,
    borderBottomWidth: 1,       // 下面畫一條分隔線
    borderColor: '#333',
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 5,
  },
  contentContainer: {
    flex: 1, // 讓內容區填滿頁籤下方的所有空間
    padding: 20,
    
  },
  activeTabItem: {
    // 當選中時，底部會有一條亮藍色的線！
    borderBottomWidth: 2,
    borderBottomColor: '#3498db', 
  },
  tabText: {
    color: '#888', // 沒選中時是暗灰色
    fontSize: 14,
    fontWeight: 'bold',
  },
  leftPanel: {
    flex: 1, // 拿走一半的空間
    borderRightWidth: 1, // 右邊畫一條分隔線
    borderColor: '#E0E0E0',
    backgroundColor: '#2d2d2d',
  },
  rightPanel: {
    flex: 1, // 拿走另一半的空間
    padding: 15,
    backgroundColor: '#242121', // 給一個稍微不一樣的底色
  },
  codeHeader: {
    marginBottom: 10,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  activeTabText: {
    color: '#fff', // 選中時變成純白色
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row', // 🌟 這是左右分屏的關鍵！
  },
  
  // 上半部樣式
  topSection: {
    backgroundColor: '#FAFAFA',
  },
  topScrollContent: {
    padding: 20,
    paddingBottom: 40, // 底部留點空白
  },
  
  levelTitle: { 
    fontSize: 28, 
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff'
  },
  
  // 分隔線樣式
  divider: {
    height: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3, // 三條線的間距
    // 加上一點點陰影讓它看起來更立體
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    elevation: 3, 
  },
  dragHandle: {
    width: 35,
    height: 2,
    backgroundColor: '#9E9E9E',
    borderRadius: 1,
  },
  codeTabContainer: {
    flex: 1, // 讓寫程式的區塊填滿剩餘空間
  },
  // 下半部樣式
  bottomSection: {
    flex: 1, // 魔法：自動填滿剩下的空間
    padding: 15,
    backgroundColor: '#1E1E1E', // 整個下半部變成深色，更有 Hacker 感覺
  },
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 60, paddingHorizontal: 20 },
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
    color: '#ebe5e5',
    lineHeight: 20, // 行高，讓文字不要擠在一起
  },
  codeEditorContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2d2d2d', // 深色背景，像 VS Code
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  codeInput: {
    flex:1,
    color: '#00ff00',      // 綠色文字，駭客風格
    fontSize: 16,
    fontFamily: 'monospace', // 等寬字體 (讓它看起來像程式碼)
    minHeight: 100,          // 最小高度
    textAlignVertical: 'top',
  },
});