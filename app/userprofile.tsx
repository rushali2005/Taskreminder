import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert,ScrollView,TouchableOpacity} from 'react-native';
import { auth, db } from '@/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface UserData {
  name: string;
  email: string;
  phoneNumber: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert('Error', 'User not logged in');
          setLoading(false);
          return;
        }

        const userDoc = doc(db, 'users', userId);
        const docSnapshot = await getDoc(userDoc);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserData;
          setUser(userData);
        } else {
          Alert.alert('User not found', 'No user profile data available.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const renderProfileDetail = (label: string, value: string) => (
    <View style={styles.profileDetail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const CustomButton = ({ title, onPress, icon, color = '#2ecc71' }) => (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      {icon}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={['#3498DB', '#2ECC71']} style={styles.container}>
        <Text style={styles.errorText}>No user data available.</Text>
        <CustomButton 
          title="Go to Login" 
          onPress={() => router.push('/login')}
          icon={<MaterialIcons name="login" size={24} color="white" style={styles.buttonIcon} />}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileContainer}>
          <Ionicons name='person-circle' size={120} color="white" style={styles.icon} />
          <Text style={styles.title}>User Profile</Text>

          <View style={styles.card}>
            {renderProfileDetail('Name', user.name)}
            {renderProfileDetail('Email', user.email)}
            {renderProfileDetail('Mobile Number', user.phoneNumber)}
          </View>

          <CustomButton 
            title="Edit Profile" 
            onPress={() => console.log('Edit profile')}
            icon={<MaterialIcons name="edit" size={24} color="white" style={styles.buttonIcon} />}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  profileDetail: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    color: 'white',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  icon: {
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default UserProfile;

