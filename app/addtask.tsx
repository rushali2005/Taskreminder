import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '@/firebase';
import { setDoc, doc } from 'firebase/firestore';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

const CustomButton = ({ 
  title, 
  onPress, 
  icon, 
  color = '#2ecc71', 
  textColor = 'white',
  disabled = false,
  fullWidth = false
}: CustomButtonProps) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      { backgroundColor: color },
      fullWidth && styles.fullWidthButton
    ]} 
    onPress={onPress}
    disabled={disabled}
  >
    {icon}
    <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

interface LocationData {
  source: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
  destination: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
}

const AddTask = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState({
    taskNumber: "",
    currentLocation: "",
    destinationLocation: "",
    taskDetails: "",
    time: ""
  });

  useEffect(() => {
    if (params.locationData) {
      try {
        const parsedData = JSON.parse(params.locationData as string) as LocationData;
        setLocationData(parsedData);
        setFormData(prev => ({
          ...prev,
          currentLocation: parsedData.source?.name || prev.currentLocation,
          destinationLocation: parsedData.destination?.name || prev.destinationLocation
        }));
      } catch (error) {
        console.error("Error parsing location data:", error);
      }
    }
  }, [params.locationData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSet = async () => {
    if (Object.values(formData).some(field => field === "")) {
      Alert.alert("Error", "Please fill out all fields!");
      return;
    }
    
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const taskDocRef = doc(db, 'tasks', `${user.uid}_${formData.taskNumber}`);
        
        await setDoc(taskDocRef, {
          ...formData,
          userId: user.uid,
          sourceCoordinates: locationData?.source ? {
            latitude: locationData.source.latitude,
            longitude: locationData.source.longitude
          } : null,
          destinationCoordinates: locationData?.destination ? {
            latitude: locationData.destination.latitude,
            longitude: locationData.destination.longitude
          } : null
        });
        
        Alert.alert("Success", "Task Added Successfully!");
        setFormData({
          taskNumber: "",
          currentLocation: "",
          destinationLocation: "",
          taskDetails: "",
          time: ""
        });
        setLocationData(null);
      } else {
        Alert.alert("Error", "User not authenticated.");
      }
    } catch (error) {
      console.error("Error adding task: ", error);
      Alert.alert("Error", "Failed to add task.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    hasMapSelection?: boolean
  ) => (
    <View style={styles.locationContainer}>
      <View style={styles.inputBoxContainer}>
        {icon}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.textInput}
          placeholderTextColor="rgba(10, 10, 10, 0.7)"
        />
      </View>
      {hasMapSelection && (
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeText}>Map Selected</Text>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient style={styles.container} colors={['#4facfe', '#00f2fe']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Add New Task</Text>

            {renderInput(
              <MaterialIcons name="title" size={24} color="black" />,
              'Enter Task Title',
              formData.taskNumber,
              (text) => handleInputChange('taskNumber', text)
            )}
            
            {renderInput(
              <MaterialIcons name="description" size={24} color="black" />,
              'Task Details',
              formData.taskDetails,
              (text) => handleInputChange('taskDetails', text)
            )}
            
            {renderInput(
              <Ionicons name="location-outline" size={24} color="black" />,
              'Enter Your Current Location',
              formData.currentLocation,
              (text) => handleInputChange('currentLocation', text),
              !!locationData?.source
            )}
            
            {renderInput(
              <Ionicons name="navigate-outline" size={24} color="black" />,
              'Enter Your Destination Place',
              formData.destinationLocation,
              (text) => handleInputChange('destinationLocation', text),
              !!locationData?.destination
            )}
            
            {renderInput(
              <Ionicons name="calendar-outline" size={24} color="black" />,
              'Enter Date',
              formData.time,
              (text) => handleInputChange('time', text)
            )}

            <CustomButton 
              title="Select Location on Map" 
              onPress={() => router.push('/loca')}
              icon={<Feather name="map-pin" size={24} color="white" style={styles.buttonIcon} />}
              color="#FFD700"
              textColor="black"
              fullWidth={true}
            />

            <CustomButton 
              title="Set" 
              onPress={onSet}
              icon={<Ionicons name="checkmark-circle" size={24} color="white" style={styles.buttonIcon} />}
              disabled={isLoading}
              fullWidth={true}
            />

            {isLoading && <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBoxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 15,
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
    color: 'black',
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loader: {
    marginTop: 20,
  },
  locationContainer: {
    width: '100%',
    position: 'relative',
  },
  locationBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(46, 204, 113, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  locationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AddTask;
