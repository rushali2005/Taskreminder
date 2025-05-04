import { 
  View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, 
  Platform, TouchableOpacity, ScrollView 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import MyButton from '@/app/MyButton';
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat } from 'react-native-reanimated';
import { runOnUI } from 'react-native-reanimated';

// Validation Functions
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password.length >= 8;

const Register = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeIn = useSharedValue(0);
  const bounceTitle = useSharedValue(0);
  const gradientValue = useSharedValue(0);

  useEffect(() => {
    runOnUI(() => {
      fadeIn.value = withTiming(1, { duration: 1000 });
      bounceTitle.value = withSpring(1, { damping: 5, stiffness: 100 });
    gradientValue.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
  })();
}, []);


  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: fadeIn.value }],
  }));

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceTitle.value }],
  }));

  const animatedGradient = useAnimatedStyle(() => ({
    opacity: gradientValue.value,
  }));

  const onRegister = async () => {
    if (!name || !mobile || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
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

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phoneNumber: mobile,
        createdAt: new Date(),
      });

      // Store user data locally
      await AsyncStorage.multiSet([
        ['username', name],
        ['email', email],
      ]);

      Alert.alert("Success", "Account created successfully!");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", error.message);
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

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Animated Title */}
          <Animated.Text style={[styles.title, bounceStyle]}>Sign Up</Animated.Text>
          <Animated.Text style={[styles.subtitle, fadeInStyle]}>Create an Account</Animated.Text>

          {/* Name Input */}
          <Animated.View style={[styles.inputBoxContainer, fadeInStyle]}>
            <Ionicons name='person' size={24} color="black" />
            <TextInput
              placeholder='Enter Your Name'
              value={name}
              onChangeText={setName}
              style={styles.textInput}
            />
          </Animated.View>

          {/* Mobile Input */}
          <Animated.View style={[styles.inputBoxContainer, fadeInStyle]}>
            <Ionicons name='call' size={24} color="black" />
            <TextInput
              placeholder='Enter Your Mobile Number'
              value={mobile}
              onChangeText={setMobile}
              keyboardType='phone-pad'
              style={styles.textInput}
            />
          </Animated.View>

          {/* Email Input */}
          <Animated.View style={[styles.inputBoxContainer, fadeInStyle]}>
            <Fontisto name='email' size={24} color="black" />
            <TextInput
              placeholder='Enter Your Email Id'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              style={styles.textInput}
            />
          </Animated.View>

          {/* Password Input */}
          <Animated.View style={[styles.inputBoxContainer, fadeInStyle]}>
            <MaterialIcons name='lock' size={24} color="black" />
            <TextInput
              placeholder='Enter Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.textInput}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="black" />
            </TouchableOpacity>
          </Animated.View>

          {/* Confirm Password Input */}
          <Animated.View style={[styles.inputBoxContainer, fadeInStyle]}>
            <MaterialIcons name='lock' size={24} color="black" />
            <TextInput
              placeholder='Confirm Password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              style={styles.textInput}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="black" />
            </TouchableOpacity>
          </Animated.View>

          {/* Register Button with Animated Press Effect */}
          <Animated.View style={fadeInStyle}>
            <MyButton title={"Register"} onPress={onRegister} backgroundColor="#5A9" textColor="#fff" isLoading={isLoading} />
          </Animated.View>

          {/* Login Link */}
          <Animated.View style={fadeInStyle}>
            <Link href={'/login'} style={styles.linkText}>Already have an Account? Login</Link>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    color:"black",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  inputBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color:"black",
  },
  linkText: {
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 17,
    marginTop: 30,
  },
});

export default Register;
