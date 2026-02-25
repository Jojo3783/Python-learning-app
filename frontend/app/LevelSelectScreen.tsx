import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';

const LEVELS = [
  { id: 1, name: '輸出Hello world', color: '#ffcdd2' },
  { id: 2, name: '資料型態', color: '#ffcdd2' },
  { id: 3, name: '算術運算', color: '#ffcdd2' },
  { id: 4, name: '條件判斷', color: '#ffcdd2' },
  { id: 5, name: 'for迴圈', color: '#ffcdd2' },
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
    <View style={styles.container}>
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
              <Text style={styles.levelBtnText}>
                第 {level.id} 關：{level.name}
                {isCompleted && ' ✔️'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  levelBtn: {
    width: 350,
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  levelBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedBtn: {
    opacity: 0.7,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});