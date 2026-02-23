// 這邊類似 Navgation
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
     
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="LevelSelectScreen" 
        options={{ title: '關卡' }} 
      />

      <Stack.Screen 
        name="LoginScreen" 
        options={{ title: '會員登入' }} 
      />
      
      <Stack.Screen 
        name="SignUpScreen" 
        options={{ title: '註冊new account' }} 
      />
    </Stack>
  );
}