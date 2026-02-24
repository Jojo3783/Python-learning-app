// first page  (welcome page)
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 



export default function index() {
  const router = useRouter(); 

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundColor }]}>
      <View style={styles.content}>
        
       
        <Text style={styles.title}>
          Start Your Learning Journey Here!
        </Text>

       
        
        <View style={styles.imageContainer}>
          <Image 
             source={require("../assets/images/TA.png")} 
            style={{ width: 500, height: 500 }} 
            resizeMode="contain" 
          />
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
    </SafeAreaView>
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
