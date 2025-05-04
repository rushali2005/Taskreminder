import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  SlideInLeft, 
  SlideInRight, 
  BounceIn, 
  LightSpeedInLeft, 
  LightSpeedInRight, 
  Easing 
} from 'react-native-reanimated';

// Custom Gradient Button with Animation
const GradientButton = ({ title, onPress }) => (
  <Animated.View entering={BounceIn.delay(1000)}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

const Welcome = () => {
  const router = useRouter();

  const onContinue = () => {
    router.push("/login");
  };

  return (
    <LinearGradient colors={['#3498DB', '#2ECC71']} style={styles.container}>
      
      {/* Floating Image Animation */}
      <Animated.Image
        source={require('@/assets/images/map.png')}
        style={styles.mapImage}
        resizeMode="cover"
        entering={LightSpeedInLeft.duration(1500)}
      />

      <View style={styles.contentContainer}>
        
        {/* Title with Slide-in Effect */}
        <Animated.Text 
          style={styles.title} 
          entering={SlideInLeft.duration(1200).easing(Easing.ease)}
        >
          Welcome to RemindZone
        </Animated.Text>

        {/* Subtitle with Different Slide-in */}
        <Animated.Text 
          style={styles.subtitle} 
          entering={SlideInRight.duration(1300).easing(Easing.ease)}
        >
          Explore the world around you
        </Animated.Text>

        {/* Gradient Button with Bounce Animation */}
        <GradientButton title="Get Started" onPress={onContinue} />

      </View>
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapImage: {
    width: "100%",
    height: 400,
    marginTop: 80,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Welcome;
