import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Animated, 
  KeyboardAvoidingView, Dimensions, TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [emailText, setEmailText] = useState('');

  // 動態動畫數值
  const botY = useRef(new Animated.Value(0)).current;      // 呼吸與上下位移
  const headRotate = useRef(new Animated.Value(0)).current; // 左右轉頭
  const blushOpacity = useRef(new Animated.Value(0)).current; // 臉紅透明度
  const handY = useRef(new Animated.Value(20)).current;    // 摀住眼睛的手

  // 1. 呼吸動畫
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(botY, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(botY, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // 2. 當 Email 字數改變時，頭部微轉（模擬盯著字看）
  useEffect(() => {
    let rotation = Math.min(Math.max(emailText.length * 2 - 15, -15), 15);
    Animated.spring(headRotate, {
      toValue: rotation,
      useNativeDriver: true,
    }).start();
  }, [emailText]);

  // 3. 處理「害羞」模式 (密碼框時)
  useEffect(() => {
    if (isPwdFocused) {
      // 臉紅、手抬起來
      Animated.parallel([
        Animated.timing(blushOpacity, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        Animated.spring(handY, { toValue: -20, friction: 5, useNativeDriver: true }),
        Animated.spring(headRotate, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      // 恢復正常
      Animated.parallel([
        Animated.timing(blushOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.spring(handY, { toValue: 20, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [isPwdFocused]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000428', '#004e92']} style={styles.background} />

      <KeyboardAvoidingView behavior="padding" style={styles.content}>
        
     
        <Animated.View style={[
          styles.botContainer, 
          { transform: [{ translateY: botY }, { rotate: headRotate.interpolate({
            inputRange: [-15, 15],
            outputRange: ['-15deg', '15deg']
          }) }] }
        ]}>
          <View style={styles.botHead}>
            <View style={styles.eyeRow}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            {/* 臉紅 */}
            <Animated.View style={[styles.blushRow, { opacity: blushOpacity }]}>
              <View style={styles.blushCircle} />
              <View style={styles.blushCircle} />
            </Animated.View>
          </View>
          {/* 小手手 */}
          <Animated.View style={[styles.handsContainer, { transform: [{ translateY: handY }] }]}>
            <View style={styles.hand} />
            <View style={styles.hand} />
          </Animated.View>
        </Animated.View>

        {/* 登入卡片 */}
        <View style={styles.cardWrapper}>
          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <Text style={styles.title}>Welcome</Text>
            
            <TextInput
              style={styles.input}
              placeholder="請輸入 Email..."
              onChangeText={setEmailText}
              onFocus={() => setIsPwdFocused(false)}
            />

            <TextInput
              style={styles.input}
              placeholder="請輸入密碼 (我不會看哦)"
              secureTextEntry
              onFocus={() => setIsPwdFocused(true)}
              onBlur={() => setIsPwdFocused(false)}
            />

            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginText}>登入</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // bot's外觀
  botContainer: { alignItems: 'center', marginBottom: -25, zIndex: 10 },
  botHead: {
    width: 80,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeRow: { flexDirection: 'row', gap: 20 },
  eye: { width: 8, height: 8, backgroundColor: '#333', borderRadius: 4 },
  blushRow: { flexDirection: 'row', gap: 40, position: 'absolute', bottom: 15 },
  blushCircle: { width: 12, height: 6, backgroundColor: '#FF9999', borderRadius: 5 },
  handsContainer: { flexDirection: 'row', gap: 45, position: 'absolute', bottom: 0 },
  hand: { width: 25, height: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 2, borderColor: '#333' },

  // 卡片與輸入
  cardWrapper: { width: width * 0.85, borderRadius: 30, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.3)' },
  glassCard: { padding: 30, paddingTop: 50, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#444', marginBottom: 20 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  loginBtn: {
    backgroundColor: '#333',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  loginText: { color: '#fff', fontWeight: 'bold' }
});