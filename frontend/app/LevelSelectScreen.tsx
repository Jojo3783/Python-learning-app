import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const LEVELS = [
  { id: 1, name: '輸出Hello world', color: '#ffcdd2' },
  { id: 2, name: '資料型態', color: '#ffcdd2' },
  { id: 3, name: '算術運算', color: '#ffcdd2' },
  { id: 4, name: '條件判斷', color: '#ffcdd2' },
  { id: 5, name: 'for迴圈', color: '#ffcdd2' },
  { id: 6, name: 'for迴圈', color: '#ffcdd2' },
];

export default function LevelSelectScreen() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');
  const [completedLevels, setCompletedLevels] = useState<Record<number, boolean>>({});
  const [animations] = useState(LEVELS.map(() => new Animated.Value(0)));

  // API 連接測試
  useEffect(() => {
    apiService.testConnection()
      .then(data => setStatusMessage(data.message))
      .catch(err => setStatusMessage('API 連接失敗'));
  }, []);

  // 進場動畫（關卡一個個浮上來）
  useEffect(() => {
    Animated.stagger(
      100,
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
    <ScrollView>
      <LinearGradient
      // 設定漸層顏色：由深藍轉向極深黑藍，更有宇宙感
      colors={['#1A237E', '#121858', '#0D1231']} style={styles.container}>
        <Text style={styles.headerTitle}>請選擇關卡</Text>
        {statusMessage && (
          <Text style={styles.statusText}>{statusMessage}</Text>
        )}

        {LEVELS.map((level, index: number) => {
          const isCompleted = completedLevels[level.id];
          const opacity = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });
          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });

          return (
            <Animated.View
              key={level.id}
              style={{
                opacity,
                transform: [{ translateY }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.levelBtn,
                  { backgroundColor: level.color },
                  isCompleted && styles.completedBtn,
                ]}
                onPress={() => handleLevelPress(index)}
              >
                <Text style={styles.checkMark}>
                    第 {level.id} 關：{level.name}
                  {isCompleted && ' ✔️'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00E5FF', // 螢光藍：科技感
    marginBottom: 10,
    textShadowColor: 'rgba(0, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#BBDEFB',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 20,
  },
  levelBtn: {
    width: 340,
    height: 90,
    marginVertical: 12,
    borderRadius: 20,
    // 科技感裝飾：左側粗邊條
    borderLeftWidth: 10,
    // 陰影/發光效果
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%',
  },
  iconText: {
    fontSize: 35,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
    letterSpacing: 1,
  },
  levelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  checkMark: {
    fontSize: 24,
    marginLeft: 10,  // 數字越大越往右推
    marginTop: 15,   // 數字越大越往下推
  },
  completedBtn: {
    opacity: 0.6,
    backgroundColor: '#E0E0E0',
  },
});