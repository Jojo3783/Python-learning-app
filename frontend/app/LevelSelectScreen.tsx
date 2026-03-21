// 打開控制台，輸入這 localStorage.setItem('level', ' '); 按 Enter，然後重新整理網頁 就可以改你到等級幾



import { useLevel } from '../hooks/use-level';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';// 匯入音樂
import Slider from '@react-native-community/slider';// 匯入滑桿套件
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router'; // 🌟 新增這個
const BGM_TRACKS = [
  { id: 0, name: "bgm1", file: require('../assets/Digital_Dusk.mp3') },
  { id: 1, name: "bgm2", file: require('../assets/Midnight_Reverie.mp3') },
  { id: 2, name: "bgm3", file: require('../assets/Starlight_Study_Beats.mp3') },
];
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

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(0.5); // 預設音量 50%
  const [currentTrack, setCurrentTrack] = useState(0); // 預設播第一首
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); // 控制設定選單顯示
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const volumeRef = useRef(volume);

  // 🌟 新增 2：只要 volume state 一改變，就立刻同步給 Ref
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  // 🌟 5. 當滑桿改變時，即時調整音量
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedVolume = await AsyncStorage.getItem('bgm_volume');
        const savedTrack = await AsyncStorage.getItem('bgm_track');
        
        if (savedVolume !== null) setVolume(parseFloat(savedVolume));
        if (savedTrack !== null) setCurrentTrack(parseInt(savedTrack, 10));
      } catch (error) {
        console.log("讀取設定失敗", error);
      } finally {
        setSettingsLoaded(true); // 標記為讀取完成
      }
    };
    loadSettings();
  }, []);

  /// 🌟 修改：使用 useFocusEffect，確保只有在畫面顯示時才播音樂，離開時立刻停止
  useFocusEffect(
    useCallback(() => {
      let currentSound: Audio.Sound | null = null;
      let isActive = true; // 用來標記目前畫面是否還在焦點內

      const playMusic = async () => {
        // 確保設定已經讀取完畢才開始播
        if (!settingsLoaded) return; 

        try {
          // 載入並播放音樂
          const { sound: newSound } = await Audio.Sound.createAsync(
            BGM_TRACKS[currentTrack].file,
            { shouldPlay: true, isLooping: true, volume: volumeRef.current }
          );
          
          if (isActive) {
            currentSound = newSound;
            setSound(newSound);
          } else {
            // 如果音樂載入完成時，使用者已經光速切換到別的畫面，就立刻卸載它
            newSound.unloadAsync();
          }
        } catch (error) {
          console.log("音樂播放失敗", error);
        }
      };

      playMusic();

      // 當「離開這個畫面」或「切換歌曲」時，會執行這裡的清理動作
      return () => {
        isActive = false;
        if (currentSound) {
          currentSound.unloadAsync(); // 停止並釋放記憶體
          setSound(null);
        }
      };
    }, [currentTrack, settingsLoaded]) // ⚠️ 注意：這裡千萬不要放 volume，否則拉滑桿會導致整首歌重播
  );
  useEffect(() => {
    if (settingsLoaded) { // 確保不是初始讀取時觸發
      AsyncStorage.setItem('bgm_track', currentTrack.toString());
    }
  }, [currentTrack, settingsLoaded]);
  // 當滑桿改變時，即時調整播放中的音量
  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume);
    }
  }, [volume, sound]); // <--- 加上 sound！這樣每次載入新音樂時，也會立刻套用當下音量
  // 3. 進場動畫 (stagger 讓按鈕一個個跳出來)
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

        <TouchableOpacity //setting button
          style={styles.settingsButton}
          onPress={() => setIsSettingsVisible(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️ 音樂設定</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>編程學院</Text>
        
   
        <View style={styles.statusBadge}>
          <Text style = {styles.statusText}>GoGo</Text>
        </View>

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
      {/* 🌟 3. 音樂設定的彈出視窗 (Modal) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsVisible}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ 音樂設定</Text>
            
            <Text style={styles.settingLabel}>🎶 選擇背景音樂</Text>
            <View style={styles.trackList}>
              {BGM_TRACKS.map((track, index) => (
                <TouchableOpacity 
                  key={track.id}
                  style={[styles.trackButton, currentTrack === index && styles.trackButtonActive]}
                  onPress={() => setCurrentTrack(index)}
                >
                  <Text style={[styles.trackButtonText, currentTrack === index && styles.trackButtonTextActive]}>
                    {track.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.settingLabel}>🔊 音量控制 ({Math.round(volume * 100)}%)</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={(val) => setVolume(val)} // 拖曳時即時改變音量
              onSlidingComplete={(val) => {
                // 🌟 新增這行：手放開時存檔
                AsyncStorage.setItem('bgm_volume', val.toString()); 
              }}
              minimumTrackTintColor="#00E5FF"
              maximumTrackTintColor="#555555"
              thumbTintColor="#00E5FF"
            />

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsSettingsVisible(false)}
            >
              <Text style={styles.closeButtonText}>完成</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 10, // 確保按鈕在最上層
  },
  settingsButtonText: {
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#1E293B', // 配合你的深色科技風
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00E5FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 15,
    marginBottom: 10,
  },
  trackList: {
    flexDirection: 'column',
    gap: 10, // React Native 中控制按鈕間距的屬性
  },
  trackButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  trackButtonActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  trackButtonText: {
    color: '#888',
    textAlign: 'center',
  },
  trackButtonTextActive: {
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 25,
    backgroundColor: '#00E5FF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#0D1231',
    fontWeight: 'bold',
    fontSize: 16,
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