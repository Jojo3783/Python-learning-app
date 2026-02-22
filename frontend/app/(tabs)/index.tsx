import React, {useState} from "react";
import {Text, Button, View} from "react-native";
const HomePage = () => {//enter game 
  return (
    <View>
      <Text style={styles.text}>Python學習應用程式</Text>
      <Button 
      title="進入遊戲"
      onPress={SelectLevelPage}
      >

      </Button>
    </View>
  );
};
const SelectLevelPage = () => {//select level
  
};

const GamePage = () => {//play game

};
const main = () => {

};

const styles = ({
  text : {
  
  }
})

export default HomePage;