import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth'; 
import { auth } from '@/firebase'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CustomButton = ({ title, onPress, icon, color = '#2ecc71', textColor = 'white', isLoading = false }) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: color }]} 
    onPress={onPress}
    disabled={isLoading}
  >
    {isLoading ? (
      <ActivityIndicator color={textColor} />
    ) : (
      <>
        {icon}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </>
    )}
  </TouchableOpacity>
);

const Logout = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Yes, Logout", 
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut(auth);
              Alert.alert('Logged out', 'You have been logged out successfully.');
              router.replace('/login');
            } catch (error) {
              console.error('Error logging out: ', error);
              Alert.alert('Logout failed', 'Something went wrong while logging out.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient 
      style={styles.container}   
      colors={['#4facfe', '#00f2fe']} 
    >
      <View style={styles.contentContainer}>
        <Ionicons name="log-out-outline" size={100} color="white" />
        <Text style={styles.title}>Logout</Text>
        <Text style={styles.subtitle}>Are you sure you want to leave?</Text>
        <View style={styles.buttonContainer}>
          <CustomButton 
            title="Logout" 
            onPress={handleLogout}
            icon={<Ionicons name="log-out" size={24} color="white" style={styles.buttonIcon} />}
            color="#e74c3c"
            isLoading={isLoading}
          />
          <CustomButton 
            title="Cancel" 
            onPress={() => router.back()}
            icon={<Ionicons name="close" size={24} color="black" style={styles.buttonIcon} />}
            color="#f1c40f"
            textColor="black"
          />
        </View>
      </View>
    </LinearGradient>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default Logout;

