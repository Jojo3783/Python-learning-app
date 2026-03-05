import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  TextInputProps
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface InputFieldProps extends TextInputProps {
  label: string;
  isFocused: boolean;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 動畫值使用 useRef 確保在重新渲染時不會丟失
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blushAnim = useRef(new Animated.Value(0.3)).current;

  // 註冊邏輯
  const handleRegister = async () => {
    if (!username || !password) {
      window.alert("機器人提醒你：名字跟密碼都要填喔！");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
       
        window.alert(`歡迎加入Python學習大家庭，${data.username}！`);
        router.replace('/LoginScreen');
      } else {
        
        window.alert(data.detail || "註冊出錯");
      }
    } catch (error) {
     
      window.alert("無法連線到伺服器，請檢查網路。");
    } finally {
      setLoading(false);
    }
  };

  // 啟動機器人動畫
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );

    const blush = Animated.loop(
      Animated.sequence([
        Animated.timing(blushAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(blushAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    );

    float.start();
    blush.start();

    return () => {
      float.stop();
      blush.stop();
    };
  }, []);

  return (
    <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={styles.container}>
      {/* 裝飾背景光暈 */}
      <View style={[styles.softGlow, { top: '10%', left: '-10%', backgroundColor: '#4facfe' }]} />
      <View style={[styles.softGlow, { bottom: '15%', right: '-10%', backgroundColor: '#a18cd1' }]} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.title}>哈囉！</Text>
          <Text style={styles.subtitle}>歡迎加入我們的一員</Text>
        </View>

        <View style={styles.form}>
          <InputField 
            label="USERNAME" 
            placeholder="帳戶名" 
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsFocused('user')}
            onBlur={() => setIsFocused(null)}
            isFocused={isFocused === 'user'}
          />
          
          <View style={{ zIndex: 10 }}>
            <InputField 
              label="PASSWORD" 
              placeholder="密碼..." 
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              onFocus={() => setIsFocused('pass')}
              onBlur={() => setIsFocused(null)}
              isFocused={isFocused === 'pass'}
            />
            
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeButton}>
              <Text style={styles.eyeText}>{passwordVisible ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>

            {/* 機器人 - 確保使用 Animated.View 且 zIndex 足夠高 */}
            <Animated.View 
              style={[
                styles.botContainer, 
                { 
                  transform: [
                    { translateY: floatAnim }, 
                    { scale: 1.8 }
                  ] 
                }
              ]}
            >
              <View style={styles.chatBubble}>
                <Text style={styles.chatText}>別忘了帳號密碼喔！</Text>
                <View style={styles.chatTail} />
              </View>
              
              <View style={styles.botHead}>
                <View style={styles.eyeRow}>
                  <View style={styles.botEye} />
                  <View style={styles.botEye} />
                </View>
                <Animated.View style={[styles.blushContainer, { opacity: blushAnim }]}>
                  <View style={styles.blush} />
                  <View style={styles.blush} />
                </Animated.View>
                <View style={styles.botMouth} />
              </View>
            </Animated.View>
          </View>
        </View>

        <TouchableOpacity 
          activeOpacity={0.7} 
          style={styles.mainButton}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>{loading ? '稍等一下...' : 'Get Started'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const InputField = ({ label, isFocused, ...props }: InputFieldProps) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, isFocused && { color: '#a18cd1' }]}>{label}</Text>
    <BlurView intensity={30} tint="dark" style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
      <TextInput 
        style={styles.input} 
        placeholderTextColor="#94a3b8"
        {...props} 
      />
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  inner: {
    width: '100%',
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  form: {
    gap: 30,
    marginBottom: 60,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    fontWeight: '600',
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: 'rgba(161, 140, 209, 0.6)',
    borderWidth: 2,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 50,
    bottom: 12,
    zIndex: 20,
  },
  eyeText: {
    fontSize: 18,
  },
  botContainer: {
    position: 'absolute',
    right: 40,
    top: -180, // 稍微往下移一點點避免跑出螢幕
    alignItems: 'center',
    zIndex: 999,
  },
  chatBubble: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    borderBottomRightRadius: 2,
    marginBottom: 6,
  },
  chatText: {
    color: '#1e293b',
    fontSize: 10,
    fontWeight: '700',
  },
  chatTail: {
    position: 'absolute',
    bottom: -6,
    right: 6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    borderTopWidth: 7,
    borderTopColor: '#fff',
  },
  botHead: {
    width: 40,
    height: 35,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  botEye: {
    width: 5,
    height: 5,
    backgroundColor: '#00f2fe',
    borderRadius: 3,
  },
  blushContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    marginTop: 1,
  },
  blush: {
    width: 7,
    height: 3,
    backgroundColor: '#ff7eb3',
    borderRadius: 2,
  },
  botMouth: {
    width: 8,
    height: 2,
    backgroundColor: '#fff',
    marginTop: 3,
  },
  mainButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
});