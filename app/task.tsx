"use client"

import { useState } from "react"
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar } from "react-native"
import TaskAccuracy from "./taskaccuracy"

export default function App() {
  const [userId, setUserId] = useState("")
  const [showStats, setShowStats] = useState(false)

  const handleViewStats = () => {
    if (userId.trim()) {
      setShowStats(true)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {!showStats ? (
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Task Accuracy Dashboard</Text>
          <Text style={styles.subtitle}>Enter your user ID to view your task statistics</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your user ID"
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleViewStats} disabled={!userId.trim()}>
            <Text style={styles.buttonText}>View Statistics</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowStats(false)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <TaskAccuracy userId={userId} />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "white",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4facfe",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsContainer: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4facfe",
  },
})

