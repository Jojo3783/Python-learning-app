import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const LEVELS = [
  { id: 1, name: '新手村', monster: '史萊姆', hp: 10, color: '#e0f7fa' },
  { id: 2, name: '黑暗森林', monster: '大蜘蛛', hp: 50, color: '#d7ccc8' },
  { id: 3, name: '魔王城', monster: '噴火龍', hp: 100, color: '#ffcdd2' },
];

export default function GameScreen() {
  const router = useRouter();
  const { targetLevelIndex } = useLocalSearchParams();

  const currentLevel = LEVELS[Number(targetLevelIndex)];

  const handleWin = () => {
    Alert.alert('🎉 勝利！', `你打敗了 ${currentLevel.monster}`, [
      { text: '回選關', onPress: () => router.back() },
      { text: '回首頁', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentLevel.color }]}>
      <Text style={styles.levelTitle}>第 {currentLevel.id} 關</Text>

      <Text style={{ fontSize: 60 }}>👾</Text>
      <Text style={styles.monsterName}>{currentLevel.monster}</Text>
      <Text>HP: {currentLevel.hp}</Text>

      <Button title="發動攻擊 (Win)" onPress={handleWin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  levelTitle: { fontSize: 28, fontWeight: 'bold' },
  monsterName: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
});