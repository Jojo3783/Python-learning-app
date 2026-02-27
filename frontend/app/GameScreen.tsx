import React, {useState} from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput, TouchableOpacity, ScrollView  } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {LEVELS} from "./LEVELS";

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
  const [code, setCode] = useState('');
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
        <View style={styles.codeEditorContainer}>
        <TextInput
          style={styles.codeInput}
          multiline={true}             // 允許換行
          numberOfLines={20}            // 預設顯示幾行高度
          placeholder="請在此輸入 Python 程式碼..."
          placeholderTextColor="#999"
          value={code}
          onChangeText={setCode}       // 當文字改變時，存入 state
          autoCapitalize="none"        // 關閉自動大寫 (寫程式很重要！)
          autoCorrect={false}          // 關閉自動修正
          textAlignVertical="top"      // 讓文字從上面開始打 (Android 需要這行)
        />
      </View>
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
  codeEditorContainer: {
    width: '100%',
    backgroundColor: '#2d2d2d', // 深色背景，像 VS Code
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  codeInput: {
    color: '#00ff00',      // 綠色文字，駭客風格
    fontSize: 16,
    fontFamily: 'monospace', // 等寬字體 (讓它看起來像程式碼)
    minHeight: 100,          // 最小高度
  },
});