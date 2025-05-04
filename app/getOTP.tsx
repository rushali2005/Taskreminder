import { View, Text, TextInput, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import MyButton from '@/components/MyButton';
import { LinearGradient } from 'expo-linear-gradient';

const GetOTP = () => {
  const router = useRouter();

  const onGetOTP = () => {
    router.navigate("/login");
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={["#ffe53b", "#ff005b"]}
    >
      <View style={styles.centeredView}>
        <View style={styles.transparentBox}>
          <TextInput 
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
          />
          <MyButton title={"Submit"} onPress={onGetOTP} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    height: 50,
    width: '100%',
    paddingHorizontal: 70,
    borderColor: '#ddd',
    borderRadius: 15,
    marginBottom: 20,
    textAlign: 'center',  
  },
  transparentBox: {
    width: '100%',
    padding: 20,
    backgroundColor: 'transparent',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
});

export default GetOTP;
