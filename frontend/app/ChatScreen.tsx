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
          <Text style={{ color: '#00050a', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
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
              value={inputText}
              onChangeText={setInputText}
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
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerTeacher: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  headerStatus: { fontSize: 12, color: '#4A90E2' },
  listContent: { paddingHorizontal: 15, paddingVertical: 20 },
  bubbleContainer: { flexDirection: 'row', marginVertical: 8, alignItems: 'flex-end' },
  aiContainer: { alignSelf: 'flex-start' },
  userContainer: { alignSelf: 'flex-end' },
  avatarMini: { fontSize: 20, marginRight: 8, marginBottom: 5 },
  bubble: { padding: 12, borderRadius: 20, maxWidth: '100%' },
  aiBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05 },
  userBubble: { backgroundColor: '#4A90E2', borderBottomRightRadius: 4 },
  msgText: { fontSize: 16, lineHeight: 22 },
  aiText: { color: '#444' },
  userText: { color: '#FFF' },
  bottomArea: { backgroundColor: '#FFF', padding: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  suggestionRow: { flexDirection: 'row', marginBottom: 10, justifyContent: 'center' },
  suggestBtn: { backgroundColor: '#F0F4F8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginHorizontal: 4, borderWidth: 1, borderColor: '#DDE6ED' },
  suggestText: { fontSize: 13, color: '#556' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F2F2F2', borderRadius: 25, paddingHorizontal: 15, height: 45 },
  sendBtn: { marginLeft: 10, backgroundColor: '#4A90E2', paddingHorizontal: 20, height: 45, borderRadius: 25, justifyContent: 'center' },
  sendBtnText: { color: '#FFF', fontWeight: 'bold' }
});