import React, {useState} from "react";
import {Text, Button, View, StyleSheet} from "react-native";
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

const styles = StyleSheet.create({//error need to be fix
  text : {
    text-align: "center",

  },

});

export default HomePage;