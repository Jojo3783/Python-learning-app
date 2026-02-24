import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const LEVELS = [
  { id: 1, name: '輸出Hello world', color: '#ffcdd2' },
  { id: 2, name: '資料型態', color: '#ffcdd2' },
  { id: 3, name: '算術運算', color: '#ffcdd2' },
  { id: 4, name: '條件判斷',  color: '#ffcdd2' },
  { id: 5, name: 'for迴圈',  color: '#ffcdd2' },
];


export default function LevelSelectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>請選擇關卡</Text>

      {LEVELS.map((level, index) => (
        <TouchableOpacity
          key={level.id}
          style={[styles.levelBtn, { backgroundColor: level.color }]}
          onPress={() => {
            router.push({
              pathname: "/GameScreen",
              params: { targetLevelIndex: index },
            });
          }}
        >
          <Text style={styles.levelBtnText}>
            第 {level.id} 關：{level.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  levelBtn: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  levelBtnText: { fontSize: 18, fontWeight: 'bold' },
});