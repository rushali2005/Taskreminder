import { View, Text ,ImageBackground,StyleSheet } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';

const finishtask = () => {
  return (
    <LinearGradient
    style={styles.container}
    colors={["#ffe53b","#ff005b"]}
   >
    <View style ={{flex:1,justifyContent:"center",alignItems:"center"}}>
   
       <Text>Finish task</Text>
   
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create ({
  container:{
    flex:1,
    backgroundColor:"#fff",
    alignItems:"center",
    justifyContent:"center",
  },
});

export default finishtask