// 打開控制台，輸入這 localStorage.setItem('level', ' '); 按 Enter，然後重新整理網頁 就可以改你到等級幾



import { useLevel } from '../hooks/use-level';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

// 1. 定義關卡資料 
const LEVELS = [
  { id: 1, name: '輸出 Hello world', color: '#4FC3F7' },
  { id: 2, name: '資料型態', color: '#9575CD' },
  { id: 3, name: '算術運算', color: '#4DB6AC' },
  { id: 4, name: '條件判斷', color: '#FF8A65' },
  { id: 5, name: 'for 迴圈', color: '#F06292' },
];

export default function LevelSelectScreen() {
  const { level: currentProgress } = useLevel(); 
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('連線中...');
  
  // 這裡存放完成狀態，暫時預設第1關已完成
  const [completedLevels] = useState<Record<number, boolean>>({ 0: false });

  // 2. 動畫陣列初始化 (使用 Lazy Initializer 確保穩定)
  const [animations] = useState(() => LEVELS.map(() => new Animated.Value(0)));

  // 3. API 連接測試
  useEffect(() => {
    apiService.testConnection()
      .then(data => setStatusMessage(data.message))
      .catch(() => setStatusMessage('連線失敗'));
  }, []);

  // 4. 進場動畫 (stagger 讓按鈕一個個跳出來)
  useEffect(() => {
    Animated.stagger(
      80,
      animations.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleLevelPress = (index: number) => {
    router.push({
      pathname: '/GameScreen',
      params: { targetLevelIndex: index },
    });
  };

  return (
    // 修正：LinearGradient flex: 1 確保填滿螢幕
    <LinearGradient
      colors={['#1A237E', '#121858', '#0D1231']}
      style={styles.mainContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        
        <Text style={styles.headerTitle}>編程學院</Text>
        
   
        {statusMessage ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}> {statusMessage}</Text>
          </View>
        ) : null}

        {/* 關卡列表 */}
        {LEVELS.map((level, index: number) => {
         // 3. 核心判斷：如果關卡的 id 大於目前的進度，就是「鎖定」
          const isLocked = level.id > currentProgress;
          // 如果關卡的 id 小於目前的進度，就是「已完成」
          const isCompleted = level.id < currentProgress;

          return (
            <Animated.View key={level.id} style={{ opacity: animations[index] }}>
              <TouchableOpacity
                // 4. 鎖定時禁用按鈕，點了沒反應
                disabled={isLocked}
                style={[
                  styles.levelBtn,
                  { 
                    // 鎖定時側邊條變灰色，沒鎖定用原本顏色
                    borderLeftColor: isLocked ? '#555' : level.color, 
                    // 鎖定時背景變深色 (符合你的科技感)，沒鎖定用白色
                    backgroundColor: isLocked ? 'rgba(255,255,255,0.1)' : '#FFFFFF' 
                  }
                ]}
                onPress={() => handleLevelPress(index)}
              >
                <View style={styles.btnContent}>
                  <View style={styles.textContainer}>
                    {/* 5. 顯示 Mission 編號，鎖定時加上鎖頭 */}
                    <Text style={[styles.levelNumber, { color: isLocked ? '#666' : '#9E9E9E' }]}>
                      MISSION {String(level.id).padStart(2, '0')} {isLocked && '🔒'}
                    </Text>
                    
                    {/* 6. 關卡名稱，鎖定時字體變暗 */}
                    <Text style={[styles.levelName, { color: isLocked ? '#8f8b8b' : '#333' }]}>
                      第 {level.id} 關：{level.name}
                    </Text>
                  </View>

                  {/* 7. 已完成的顯示勾勾 */}
                  
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00E5FF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 229, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    marginBottom: 25,
  },
  statusText: {
    fontSize: 13,
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  levelBtn: {
    width: 340,
    height: 85,
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    borderRadius: 15,
    borderLeftWidth: 10,
    // 陰影
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%',
    position: 'relative',
  },
  textContainer: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9E9E9E',
    letterSpacing: 1,
    marginBottom: 2,
  },
  levelName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
  },
  checkMark: {
    fontSize: 22,
    position: 'absolute',
    right: 20,
  },
  completedBtn: {
    opacity: 0.8,
  },
});