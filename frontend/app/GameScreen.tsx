{/* todo list */}
// 點一個地方可以開一個新的頁面 可以跟ＡＩ communication (非即時，有cd時間，不是想問就問)
//程式碼送出以後會進入 新頁面（會出現AC WA等等，結果  還有AI 點出問題）（成功之後要鎖程式畫面）
import React, {useState,  useEffect} from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, TouchableOpacity, ScrollView, Dimensions, PanResponder  } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import {LEVELS} from "./LEVELS";
import { useLevel } from '../hooks/use-level';


export default function GameScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { targetLevelIndex } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const currentLevel = LEVELS[Number(targetLevelIndex)];
  // 用來記錄目前選中的是哪個頁籤，預設是 'description' (題目描述)
  const [activeTab, setActiveTab] = useState('description');
  const { level: currentProgress } = useLevel(); //get level
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => {
              router.push({
                pathname: '/ChatScreen',
                params: { targetLevelIndex: targetLevelIndex }
              });
            } 
          }
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
  
  const handleWin = () => {
    window.alert(`你完成了${currentLevel.id}關`);
  };

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
          <Text style={styles.levelTitle}>第 {currentLevel.id} 關</Text>

          {/* --- 當點擊「題目描述」時顯示 --- */}
          {activeTab === 'description' && (
            <ScrollView>
              <Text style={styles.contentText}>{currentLevel.question}</Text>
            </ScrollView>
          )}

          {/* --- 當點擊「觀念提示」時顯示 --- */}
          {activeTab === 'hint' && (
            <ScrollView>
              <Text style={styles.contentText}>{currentLevel.description}</Text>
            </ScrollView>
          )}
        </View>
      </View>


      {/*右半邊*/}
      <View style={styles.rightPanel}>
        
        <View style={styles.codeHeader}>
          <Text style={styles.codeTitle}>撰寫 Python Code</Text>
        </View>

        <View style={styles.codeEditorContainer}>
          <TextInput
            style={styles.codeInput} 
            multiline={true}//可以多行
            placeholder="請在此輸入 Python 程式碼..."//標題
            placeholderTextColor="#999"//標題顏色
            value={code}//儲存裡面的文字
            onChangeText={setCode}//文字改變時update code
            autoCapitalize="none"//關掉自動大寫
            autoCorrect={false}//自動拼寫修正
            textAlignVertical="top"
          />
        </View>
        
        <Button title="送出批改" onPress={handleWin} color="#4CAF50" />
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