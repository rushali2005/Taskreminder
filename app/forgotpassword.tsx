import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Fontisto } from '@expo/vector-icons';
import { auth } from "@/firebase";  
import { sendPasswordResetEmail } from 'firebase/auth';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  // Animation values
  const gradientValue = useSharedValue(0);
  const fadeInValue = useSharedValue(0);

  useEffect(() => {
    // Animated background transition
    gradientValue.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
    
    // Fade-in animation for form elements
    fadeInValue.value = withTiming(1, { duration: 1500 });
  }, []);

  // Animated styles
  const animatedGradient = useAnimatedStyle(() => ({
    opacity: gradientValue.value,
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
  }));

  const onPasswordReset = async () => {
    if (email === '') {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent successfully!");
      router.navigate("/login"); 
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedGradient]}>
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={['#4facfe', '#00f2fe', '#FF512F', '#DD2476']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Animated Content */}
      <Animated.View style={[styles.contentContainer, fadeInStyle]}>
        <Text style={styles.headerText}>Forgot Password</Text>

        <View style={styles.inputContainer}>
          <Fontisto name='email' size={24} color="black" style={styles.icon} />
          <TextInput
            placeholder='Enter Your Email'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            style={styles.textInput}
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={onPasswordReset}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: '80%',
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 19,
  },
});

export default ForgotPassword;
