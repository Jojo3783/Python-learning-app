// 這邊類似 Navgation
import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native'; 


export default function RootLayout() {
  return (
    <Stack>
     
      <Stack.Screen // homepage
        name="index" 
        options={{ headerShown: false }} // no header
      />

      <Stack.Screen //AI chatbot
        name="ChatScreen" 
        options={({ navigation }) => ({
          title: '剛剛der地方',
          headerShown: true,
          // headerLeft: () => (
          //   <TouchableOpacity 
          //     onPress={() => navigation.navigate('GameScreen')} 
          //     style={{ marginLeft: 15 }}
          //   >
          //     <Text style={{ color: '#00050a', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
          //   </TouchableOpacity>
          // ),
        })}

      />
      
      <Stack.Screen //levelselect page
        name="LevelSelectScreen" 
        options={({ navigation }) => ({ 
          title: '首頁',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: true, 
          headerStyle: {
            backgroundColor: 'transparent', // 配合透明
          },
          headerTintColor: '#00E5FF', // 螢光藍返回箭頭
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
        name="GameScreen" 
        options={({ navigation }) => ({
          title: '關卡',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ffffff', 
          },
          headerTintColor: '#333333', 
          headerLeft: () => (// 返回鍵
            <TouchableOpacity 
              onPress={() => navigation.navigate('LevelSelectScreen')} 
              style={{ marginLeft: 15 }}
            >
              <Text style={{ color: '#00050a', fontWeight: 'bold', fontSize: 16 }}>⬅</Text>
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