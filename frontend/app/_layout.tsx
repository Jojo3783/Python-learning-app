// 這邊類似 Navgation
import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native'; 


export default function RootLayout() {
  return (
    <Stack>
     
      <Stack.Screen // homepage
        name="index" // the root "localhost/"
        options={{ headerShown: false }} // no header
      />

      <Stack.Screen //AI chatbot
        name="ChatScreen" // "localhost/ChatScreen"
        options={({ navigation }) => ({//拿出navigation工具箱
          title: '剛剛der地方',
          headerStyle: {
            backgroundColor: '#0A0E14', 
          },
          headerTintColor: '#00FFFF',//主要內容與可互動元素的顏色(header and 箭頭)
        })}

      />
      
      <Stack.Screen //levelselect page
        name="LevelSelectScreen" // "localhost/LevelSelectScreen"
        options={({ navigation }) => ({ 
          title: '首頁',
          headerShown: true,//show header or not
          headerShadowVisible: false,//shadow or not
          headerTransparent: true, //if false it will ignore background color and push down the page 
          headerTintColor: '#00E5FF', // 螢光藍返回箭頭及標題
          headerTitleStyle: {
            fontWeight: '900',
            fontSize: 22,
            textShadowColor: 'rgba(0, 229, 255, 0.5)',
            textShadowRadius: 10,
          },
          //  強制加入左側按鈕，解決重新整理消失的問題
          headerLeft: () => (// 返回鍵
            <TouchableOpacity 
              onPress={() => navigation.navigate('index')} 
              style={{ marginLeft: 10 }}
            >
              <Text style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen //game page
        name="GameScreen" // "localhost/GameScreen"
        options={({ navigation }) => ({
          title: '關卡',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#162316', 
          },
          headerTintColor: '#ffffff',
          //  強制加入左側按鈕，解決重新整理消失的問題
          headerLeft: () => (// 返回鍵
            <TouchableOpacity 
              onPress={() => navigation.navigate('LevelSelectScreen')} 
              style={{ marginLeft: 15 }}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          }
        })}
      />

      <Stack.Screen // currently not use
        name="LoginScreen" 
        options={{ title: '會員登入' }} 
      />
      
      <Stack.Screen // currently not use
        name="SignUpScreen" 
        options={{ title: '註冊new account' }} 
      />
    </Stack>
  );
}