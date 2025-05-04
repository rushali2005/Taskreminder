import {  Text } from 'react-native'
import React from 'react'
import {  StyleSheet ,TouchableOpacity } from 'react-native';

const MyButton = ({ title ,onPress }) => {
  return (
    <TouchableOpacity 
        activeOpacity={0.5}
        style={styles.button}
        onPress={onPress}>
            <Text style ={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyButton;

const styles = StyleSheet.create ({
    button:{
            backgroundColor:"orange", 
            paddingHorizontal:80,
            paddingVertical:10,
            borderRadius:10,
            alignItems:"center",
    },
    text:{fontSize:25,fontWeight:"700",color:"black",justifyContent:"center",alignItems:"center"},
});
