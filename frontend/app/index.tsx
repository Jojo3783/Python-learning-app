// first page
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 


const themeColors = {
    backgroundColor: '#6353e0', 
    buttonColor: '#facc15',     
    textColor: '#374151',     
};

export default function index() {
  const router = useRouter(); 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundColor }]}>
      <View style={styles.content}>
        
       
        <Text style={styles.title}>
          Let's Get Started!
        </Text>

       
        
        <View style={styles.imageContainer}>
          <Image 
            // source={require("../assets/?")} 
            style={{ width: 350, height: 350 }} 
            resizeMode="contain" 
          />
        </View>
    
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.buttonColor }]}
            onPress={() => {
              router.push('/LoginScreen'); 
            }}
          >
            <Text style={[styles.buttonText, { color: themeColors.textColor }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}


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
  imageContainer: {
    flexDirection: 'row',         
    justifyContent: 'center',    
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
  }
});
