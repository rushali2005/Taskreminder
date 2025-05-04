import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, Platform, StatusBar } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"
import axios from "axios" // ✅ Added axios for API call

const { width } = Dimensions.get("window")
const startReminder = () => {
  Alert.alert("Reminder Started", "Your task reminder has started!");
};

interface ButtonProps {
  title: string
  onPress: () => void
  icon: React.ReactNode
  colors: string[]
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, icon, colors }) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
      {icon}
      <Text style={styles.buttonText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
)

const MenuItem: React.FC<Omit<ButtonProps, "colors">> = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {icon}
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
)

const Home: React.FC = () => {
  const router = useRouter()
  const [menuVisible, setMenuVisible] = useState(false)

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  return (
    <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.menuIcon} onPress={toggleMenu}>
          <Feather name="menu" size={30} color="white" />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome</Text>

          <CustomButton
            title="Add Task"
            onPress={() => router.push("/addtask")}
            icon={<MaterialIcons name="add-task" size={24} color="white" style={styles.buttonIcon} />}
            colors={["#FF9966", "#FF5E62"]}
          />

          
        </View>

        {menuVisible && (
          <View style={styles.sideMenu}>
            <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <MenuItem
              title="Change Password"
              icon={<MaterialIcons name="lock" size={24} color="white" />}
              onPress={() => router.push("/chagepassword")}
            />
            <MenuItem 
              title="User Profile"
              icon={<Ionicons name="person-outline" size={24} color="white" />}
              onPress={() => router.push("/userprofile")}
            />
            <MenuItem
              title="My Tasks"
              icon={<MaterialIcons name="task-alt" size={24} color="white" />}
              onPress={() => router.push("/addedtask")}
            />
            <MenuItem
              title="Logout"
              icon={<MaterialIcons name="logout" size={24} color="white" />}
              onPress={() => router.push("/logout")}
            />
            <MenuItem
              title="Accuracy & Graph"
              icon={<MaterialIcons name="task" size={24} color="white" />}
              onPress={() => router.push("/taskaccuracy")}
            />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    marginBottom: 40,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    width: width * 0.8,
    maxWidth: 300,
    marginBottom: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 60,
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuIcon: {
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : StatusBar.currentHeight + 10,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    padding: 10,
  },
  sideMenu: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.7,
    maxWidth: 300,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: 60,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    zIndex: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    width: "100%",
    marginBottom: 10,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 15,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 3,
  },
})

export default Home
