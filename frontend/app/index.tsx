{/* todo list */}
// 那隻fundAi要生動一點
// 當螢幕縮放時,fundai的文字會跑掉(jojo處理中)

// first page  (welcome page)
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';




export default function index() {
  const router = useRouter(); 
  const insets = useSafeAreaInsets();
  const blinkAnim = useRef(new Animated.Value(0.3)).current; // 初始透明度 0.3

  useEffect(() => {
    // 建立呼吸燈循環動畫
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,      // 變亮
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0.15,    // 變暗
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: themeColors.backgroundColor,
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <View style={styles.content}>
        
        <Text style={styles.title}>
          Start Your Learning Journey Here!
        </Text>

        
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            {/* 恢復你原本的透明度動畫與傾斜角度 */}
            <Animated.View style={[styles.bubbleContainer, { opacity: blinkAnim }]}>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>Hello Hello, I'm FundAi !!</Text>
              </View>
              <View style={styles.bubbleTail} />
            </Animated.View>
            
            <Image 
              source={require("../assets/images/TA.png")} 
              style={styles.characterImage} 
              resizeMode="contain" 
            />
          </View>
        </View>


        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { 
              backgroundColor: themeColors.buttonColor,
              marginVertical:10,
             }]}
             onPress={() => {
              router.push('/LevelSelectScreen'); 
            }}
          >
            <Text style={[styles.buttonText, { color: themeColors.textColor }]}>
              Let's Started
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.buttonColor }]}
            onPress={() => {
              router.push('/SignUpScreen'); 
            }}
          >
            <Text style={[styles.buttonText, { color: themeColors.textColor }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
          <View>
            <Text>Already have an account?</Text>
            <TouchableOpacity>
                <Text>  Log In </Text>
            </TouchableOpacity>

          </View> */}

        </View>

      </View>
    </View>
  );
}




const themeColors = {
    backgroundColor: '#8e80f5', 
    buttonColor: '#facc15',     
    textColor: '#374151',     
};

//TODO: add a file name LevelSelectPage for select level
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    marginVertical: 16,            
  },
  title: {
    color: 'white',               
    fontWeight: 'bold',           
    fontSize: 36,                 
    textAlign: 'center',          
    marginTop: 20,
  },
  imageWrapper: {
    width: 320,
    height: 320,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',        // 讓容器佔滿寬度
    alignItems: 'center',  // 讓內部的 Image 置中
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,         // 給對話框留點上方空間
  },

  buttonContainer: {
    paddingHorizontal: 28,        
  },
  button: {
    paddingVertical: 12,          
    borderRadius: 24,             
    // 陰影效果 (僅限手機版，網頁版會忽略)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
 bubbleContainer: {
    position: 'absolute',
    top: "5%",           // 距離頂部的位置，數字越小越往上
    right: "0%",         // 距離右邊的位置，數字越小越往右
    alignItems: 'center',
    zIndex: 10,
    // 讓對話框稍微傾斜一點點，看起來更活潑
    transform: [{ rotate: '10deg' }], 
  },
  bubble: {
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#facc15',
    // 限制最大寬度，避免太長把老師遮住
    maxWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    marginTop: -2,
    // 讓尾巴稍微偏左一點，指向老師的頭部
    marginRight: 40, 
  },
});
