import React, { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // 接收來自 GameScreen 的參數
  const { targetLevelIndex, currentCode } = useLocalSearchParams();
  
  const [inputText, setInputText] = useState('');
  const displayLevel = Number(targetLevelIndex) + 1;
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: `嘿！我是 fundAi 老師。我們現在在第 ${displayLevel} 關，準備好一起變強了嗎？`, 
      sender: 'ai' 
    }
  ]);

  const [emotion, setEmotion] = useState('happy'); 
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 設定 Header 返回邏輯
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.replace({
            pathname: '/GameScreen',
            params: { targetLevelIndex: targetLevelIndex }
          })} 
          style={{ marginLeft: 15 }}
        >
          <Text style={{ color: '#00FFFF', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, targetLevelIndex]);

  // 快捷選項
  const suggestions = ["這關怎麼寫？", "提示我一下", "幫我檢查程式碼"];

  // 核心：串接 FastAPI 後端
  const handleSend = async (text: string) => {
    if (text.trim() === '' || isLoading) return;

    // 1. 顯示使用者訊息
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      // 2. 發送 API 請求
      // 注意：實機測試請將 localhost 換成電腦 IP (例如 192.168.x.x)
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          level: displayLevel,
          code: currentCode || "" // 將從 GameScreen 帶過來的 code 傳給 AI
        }),
      });

      const data = await response.json();

      // 3. 處理 AI 回應
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: data.dialogue, 
        sender: 'ai' 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setEmotion(data.emotion || 'happy');

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        id: 'err', 
        text: "哎呀，老師連不上網路，可以再試一次嗎？", 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
      // 自動捲動到底部
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.bubbleContainer, item.sender === 'user' ? styles.userContainer : styles.aiContainer]}>
      {item.sender === 'ai' && <Text style={styles.avatarMini}>{emotion === 'happy' ? '😊' : emotion === 'surprised' ? '😲' : '🤔'}</Text>}
      <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.msgText, item.sender === 'user' ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <View style={styles.headerTeacher}>
          <View style={styles.headerAvatar}>
            <Text style={{fontSize: 30}}>{emotion === 'happy' ? '😊' : emotion === 'surprised' ? '😲' : '🤔'}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>fundAi 老師</Text>
            <Text style={styles.headerStatus}>{isLoading ? '正在思考中...' : '在線陪你學習'}</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.bottomArea}>
          <View style={styles.suggestionRow}>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestBtn} onPress={() => handleSend(s)}>
                <Text style={styles.suggestText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="問問老師..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)" // 配合科技感深色背景
              value={inputText}
              onChangeText={setInputText}
              
              // 核心功能：按下 Enter 發送
              onSubmitEditing={() => handleSend(inputText)}
              // 科技教室感：關閉自動校正與首字母大寫（看個人喜好）
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(inputText)}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendBtnText}>發送</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14', 
  },
  
  
  headerTeacher: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)', // 青色發光邊界
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    // 螢光陰影效果 (iOS)
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    // Android 陰影
    elevation: 10,
  },
  headerAvatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#16213E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FFFF', // 老師頭像外圈發光
  },
  headerName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginLeft: 15,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerStatus: {
    fontSize: 13,
    color: '#00FFFF', // 青色字體
    marginLeft: 15,
    marginTop: 4,
    fontWeight: '600',
  },
  
  // 聊天區域
  listContent: {
    padding: 20,
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarMini: {
    fontSize: 24,
    marginRight: 10,
    textShadowColor: '#00FFFF',
    textShadowRadius: 8,
  },
  
  // 氣泡樣式：數位視窗感
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // 深色半透明
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  userBubble: {
    backgroundColor: '#4338CA', 
    borderTopRightRadius: 20,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  msgText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  aiText: {
    color: '#E2E8F0', 
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  
  bottomArea: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.3)',
  },
  suggestionRow: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  suggestBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  suggestText: {
    color: '#A5B4FC',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#00FFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  sendBtnText: {
    color: '#0A0E14',
    fontWeight: 'bold',
    fontSize: 15,
  },
});