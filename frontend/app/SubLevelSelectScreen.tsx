import { useLevel } from '../hooks/use-level';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubLevelSelectScreen() {
  const { level: currentProgress } = useLevel(); 
  const router = useRouter();
  const navigation = useNavigation();
  
  // 接收參數
  const { mainId, mainName, color, startId, endId } = useLocalSearchParams();
  const start = Number(startId);
  const end = Number(endId);
  const mId = Number(mainId);

  // 產生子關卡陣列
  const subLevels = Array.from({ length: end - start + 1 }, (_, i) => ({
    globalId: start + i,
    displayStr: `${mId}-${i + 1}`
  }));

  const [animations] = useState(() => subLevels.map(() => new Animated.Value(0)));

  // 設定 Header 與進場動畫
  useEffect(() => {
    navigation.setOptions({ 
      title: "返回",
      headerStyle: { backgroundColor: '#121858' },
      headerShadowVisible: false,
      headerTintColor: '#00E5FF',
      headerTitleStyle: {
        fontWeight: '900',
        fontSize: 22,
        textShadowColor: 'rgba(0, 229, 255, 0.5)',
        textShadowRadius: 10,
      },
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.push('/LevelSelectScreen')}
          style={{ marginLeft: 10 }}
        >
          <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
        </TouchableOpacity>
      )
    });

    Animated.stagger(
      40,
      animations.map(anim => Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }))
    ).start();
  }, [navigation, mId, mainName]);

  const handleSubLevelPress = (globalId: number) => {
    router.push({
      pathname: '/GameScreen',
      params: { targetGlobalId: globalId },
    });
  };

  return (
    <LinearGradient colors={['#1A237E', '#121858', '#0D1231']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollArea}>
        
        <View style={styles.missionHeader}>
          <View style={styles.missionHeaderDeco} />
          <Text style={styles.titleText}>OPERATION: {mainName}</Text>
        </View>

        <View style={styles.gridWrap}>
          {subLevels.map((subLevel, index) => {
            const isLocked = subLevel.globalId > currentProgress;
            const isCompleted = subLevel.globalId < currentProgress;
            const isCurrent = subLevel.globalId === currentProgress;
            
            const activeColor = (color as string) || '#4FC3F7';
            
            // --- 顏色邏輯控制 ---
            // 當前關卡使用帥氣紫：#BF5AF2
            const currentPurple = '#BF5AF2'; 
            
            const boxBgColor = isLocked 
              ? 'rgba(255, 255, 255, 0.08)' 
              : (isCurrent ? 'rgba(191, 90, 242, 0.15)' : 'rgba(255,255,255,0.05)');
              
            const boxBorderColor = isLocked 
              ? '#78909C' 
              : (isCurrent ? currentPurple : activeColor);
              
            const textColor = isLocked 
              ? '#B0BEC5' 
              : (isCurrent ? '#FFFFFF' : '#E0E0E0');

            return (
              <Animated.View key={subLevel.globalId} style={[{ opacity: animations[index] }, styles.boxWrapper]}>
                <TouchableOpacity
                  disabled={isLocked}
                  style={[
                    styles.squareBtn,
                    { 
                      borderColor: boxBorderColor,
                      backgroundColor: boxBgColor,
                      borderStyle: isLocked ? 'dashed' : 'solid',
                      borderWidth: isCurrent ? 2.5 : 1.5, // 當前關卡邊框再厚一點點更帥
                    }
                  ]}
                  onPress={() => handleSubLevelPress(subLevel.globalId)}
                >
                  {!isLocked && (
                    <View style={[styles.cornerDot, { backgroundColor: isCurrent ? currentPurple : activeColor }]} />
                  )}

                  <Text style={[styles.btnText, { color: textColor }]}>
                    {subLevel.displayStr}
                  </Text>

                  <View style={[
                    styles.energyBar, 
                    { 
                      backgroundColor: isLocked ? 'rgba(255, 255, 255, 0.3)' : (isCurrent ? currentPurple : activeColor),
                      width: isCompleted ? '60%' : (isCurrent ? '90%' : '20%') 
                    }
                  ]} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 60,
  },

  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    paddingLeft: 5,
  },
  missionHeaderDeco: {
    width: 6,
    height: 18,
    backgroundColor: '#00E5FF',
    marginRight: 10,
    borderRadius: 2,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E0E0E0',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
  },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    rowGap: 20, 
  },
  boxWrapper: {
    // 【修改點】改為 18%，這樣 5 個會佔 90%，剩下的 10% 均分給 4 個間距，完美一排 5 個
    width: '18%', 
    aspectRatio: 1, 
  },
  
  squareBtn: {
    flex: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', 
    overflow: 'hidden',
  },
  btnText: {
    fontSize: 12, 
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
    letterSpacing: -0.5, 
  },

  cornerDot: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  energyBar: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  }
});
