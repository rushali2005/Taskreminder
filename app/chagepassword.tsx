import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { auth } from "@/firebase";
import { updatePassword } from "firebase/auth";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const isValidPassword = (password: string): boolean => password.length >= 8;

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Animated Background Color Change
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    backgroundOpacity.value = withTiming(1, { duration: 2000 });
  }, []);

  // Looping Gradient Animation (Same as Login Page)
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(Math.random() * 0.6 + 0.4, { duration: 3000 }, () => {
      backgroundOpacity.value = backgroundOpacity.value === 1 ? 0 : 1;
    }),
  }));

  const handleChangePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, password);
        Alert.alert("Success", "Password changed successfully.", [
          { text: "OK", onPress: () => router.replace("/home") }
        ]);
      } else {
        throw new Error("No authenticated user found");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    secureTextEntry: boolean = false
  ) => (
    <View style={styles.inputBoxContainer}>
      <MaterialIcons name='lock' size={24} color="white" />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.textInput}
        secureTextEntry={secureTextEntry && !showPassword}
        placeholderTextColor="rgba(255,255,255,0.7)"
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}> 
        <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedBackground, animatedStyle]}>
        <LinearGradient style={styles.container} colors={['#4facfe', '#00f2fe']} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>

            {renderInput("Enter Your New Password", password, setPassword, true)}
            {renderInput("Confirm New Password", confirmPassword, setConfirmPassword, true)}

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.disabledButton]} 
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Changing Password..." : "Change Password"}
              </Text>
            </TouchableOpacity>

            {isLoading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBoxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});

export default ChangePassword;
