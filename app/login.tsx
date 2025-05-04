import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Link, useRouter } from "expo-router";
import { Fontisto, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password.length >= 8;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Animated background transition
  const gradientValue = useSharedValue(0);

  gradientValue.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);

  const animatedGradient = useAnimatedStyle(() => {
    return {
      opacity: gradientValue.value,
    };
  });

  const onLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid); 
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date(),
          displayName: user.displayName || "Anonymous",
        });
        console.log('User data added to Firestore');
      } else {
        console.log('User data exists in Firestore');
      }
      router.replace('/home');
    } catch (error) {
      Alert.alert("Login failed", error.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedGradient]}>
        <LinearGradient
          colors={['#4facfe', '#00f2fe', '#FF512F', '#DD2476']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <Text style={styles.title}>Sign In</Text>
        
        <View style={styles.inputBoxContainer}>
          <Fontisto name='email' size={24} color="#333" />
          <TextInput
            placeholder='Enter Your Email'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            style={styles.textInput}
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputBoxContainer}>
          <MaterialIcons name='lock' size={24} color="#333" />
          <TextInput
            placeholder='Enter Your Password'
            value={password}
            onChangeText={setPassword}
            style={styles.textInput}
            secureTextEntry={!showPassword}
            placeholderTextColor="#666"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}> 
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Link href={'/forgotpassword'} style={styles.linkText}>Forgot Password?</Link>

        <TouchableOpacity style={styles.button} onPress={onLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Link href={'/register'} style={styles.linkText}>Don't have an account? Register here</Link>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputBoxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    color:"black",
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 70,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 17,
    marginTop: 10,
  },
});

export default Login;
