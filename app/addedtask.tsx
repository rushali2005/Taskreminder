
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { auth, db } from "@/firebase"
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import Checkbox from "expo-checkbox"
import * as Speech from "expo-speech"

interface Task {
  id: string
  taskNumber: string
  taskDetails: string
  currentLocation: string
  destinationLocation: string
  time: string
  completed?: boolean
  
  status: "pending" | "completed"
}

const TaskList = () => {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Error", "User not authenticated")
        setLoading(false)
        return
      }

      const tasksQuery = query(collection(db, "tasks"), where("userId", "==", user.uid))

      const querySnapshot = await getDocs(tasksQuery)
      const tasksList: Task[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        tasksList.push({
          id: doc.id,
          taskNumber: data.taskNumber,
          taskDetails: data.taskDetails,
          currentLocation: data.currentLocation,
          destinationLocation: data.destinationLocation,
          time: data.time,
          completed: data.completed || false,
          
          status: data.status || (data.completed ? "completed" : "pending"),
        })
      })

      // Sort tasks: pending first, then by time
      tasksList.sort((a, b) => {
        if (a.status === b.status) {
          return 0 // maintain original order if status is the same
        }
        return a.status === "pending" ? -1 : 1 // pending tasks first
      })

      setTasks(tasksList)
    } catch (error) {
      console.error("Error fetching tasks: ", error)
      Alert.alert("Error", "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const taskIndex = tasks.findIndex((task) => task.id === taskId)
      if (taskIndex === -1) return

      const updatedTasks = [...tasks]
      const newCompletedStatus = !updatedTasks[taskIndex].completed
      const newStatus = newCompletedStatus ? "completed" : "pending"

      // Update local state first for immediate UI feedback
      updatedTasks[taskIndex].completed = newCompletedStatus
      updatedTasks[taskIndex].status = newStatus
      
      setTasks(updatedTasks)

      // Update in Firebase
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, {
        completed: newCompletedStatus,
        status: newStatus,
        
        updatedAt: serverTimestamp(),
      })

      // If task is completed, also add to completedTasks collection
      if (newCompletedStatus) {
        console.log(`Task Completed: ${updatedTasks[taskIndex].taskNumber}`)

        // Add to completed tasks collection for analytics/history
        try {
          await addDoc(collection(db, "completedTasks"), {
            taskId: taskId,
            taskNumber: updatedTasks[taskIndex].taskNumber,
            userId: auth.currentUser?.uid,
            
            taskDetails: updatedTasks[taskIndex].taskDetails,
            currentLocation: updatedTasks[taskIndex].currentLocation,
            destinationLocation: updatedTasks[taskIndex].destinationLocation,
            
          })
        } catch (error) {
          console.error("Error saving to completed tasks: ", error)
        }

        Alert.alert("Task Completed", `${updatedTasks[taskIndex].taskNumber} completed!`)
      } else {
        // If task is marked as pending again, update pendingTasks collection
        try {
          await addDoc(collection(db, "pendingTasks"), {
            taskId: taskId,
            taskNumber: updatedTasks[taskIndex].taskNumber,
            userId: auth.currentUser?.uid,
            markedPendingAt: serverTimestamp(),
            taskDetails: updatedTasks[taskIndex].taskDetails,
            wasCompletedBefore: true,
          })
        } catch (error) {
          console.error("Error saving to pending tasks: ", error)
        }
      }
    } catch (error) {
      console.error("Error updating task: ", error)
      Alert.alert("Error", "Failed to update task status")
      fetchTasks()
    }
  }

  const completeAllTasks = async () => {
    Alert.alert("Complete All Tasks", "Are you sure you want to mark all pending tasks as completed?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Complete All",
        onPress: async () => {
          try {
            setLoading(true)
            const pendingTasks = tasks.filter((task) => task.status === "pending")

            // Update local state first for immediate UI feedback
            const updatedTasks = [...tasks]
            for (const task of updatedTasks) {
              if (task.status === "pending") {
                task.completed = true
                task.status = "completed"
                
              }
            }
            setTasks(updatedTasks)

            // Update Firestore using batch
            try {
              const batch = writeBatch(db)

              // Update main tasks collection
              for (const task of pendingTasks) {
                const taskRef = doc(db, "tasks", task.id)
                batch.update(taskRef, {
                  completed: true,
                  status: "completed",
                  
                })

                // Also add to completedTasks collection
                const completedTaskRef = doc(collection(db, "completedTasks"))
                batch.set(completedTaskRef, {
                  taskId: task.id,
                  taskNumber: task.taskNumber,
                  userId: auth.currentUser?.uid,
                  completedAt: serverTimestamp(),
                  taskDetails: task.taskDetails,
                  currentLocation: task.currentLocation,
                  destinationLocation: task.destinationLocation,
                  
                  completionMethod: "batch",
                })
              }

              await batch.commit()

              // Also add a summary record
              await addDoc(collection(db, "taskActions"), {
                action: "complete_all",
                userId: auth.currentUser?.uid,
                timestamp: serverTimestamp(),
                count: pendingTasks.length,
                taskIds: pendingTasks.map((t) => t.id),
              })

              Alert.alert("Success", `Completed ${pendingTasks.length} tasks`)
              setFilter("completed")
            } catch (error) {
              console.error("Error in batch operation: ", error)

              // Fallback to individual updates if batch fails
              for (const task of pendingTasks) {
                const taskRef = doc(db, "tasks", task.id)
                await updateDoc(taskRef, {
                  completed: true,
                  status: "completed",
                  completedAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                })

                // Also add to completedTasks collection
                await addDoc(collection(db, "completedTasks"), {
                  taskId: task.id,
                  taskNumber: task.taskNumber,
                  userId: auth.currentUser?.uid,
                  completedAt: serverTimestamp(),
                  taskDetails: task.taskDetails,
                  completionMethod: "individual",
                })
              }
            }
          } catch (error) {
            console.error("Error completing all tasks: ", error)
            Alert.alert("Error", "Failed to complete all tasks")
            fetchTasks()
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const addNewTask = async (task: Omit<Task, "id">) => {
    try {
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Error", "User not authenticated")
        return
      }

      // Add to main tasks collection
      const newTaskRef = await addDoc(collection(db, "tasks"), {
        ...task,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completed: false,
        status: "pending",
      })

      // Also add to pendingTasks collection for analytics
      await addDoc(collection(db, "pendingTasks"), {
        taskId: newTaskRef.id,
        taskNumber: task.taskNumber,
        userId: user.uid,
        createdAt: serverTimestamp(),
        taskDetails: task.taskDetails,
      })

      Alert.alert("Success", "New task added successfully")
      fetchTasks()
    } catch (error) {
      console.error("Error adding task: ", error)
      Alert.alert("Error", "Failed to add new task")
    }
  }

  const deleteTask = async (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const taskToDelete = tasks.find((t) => t.id === taskId)

            // Delete from main tasks collection
            await deleteDoc(doc(db, "tasks", taskId))

            // Record deletion in taskActions collection
            await addDoc(collection(db, "taskActions"), {
              action: "delete",
              userId: auth.currentUser?.uid,
              timestamp: serverTimestamp(),
              taskId: taskId,
              taskNumber: taskToDelete?.taskNumber,
              previousStatus: taskToDelete?.status,
            })

            Alert.alert("Task Deleted", "Task has been deleted successfully.")
            fetchTasks()
          } catch (error) {
            console.error("Error deleting task: ", error)
            Alert.alert("Error", "Failed to delete task")
          }
        },
        style: "destructive",
      },
    ])
  }

  const editTask = (task: Task) => {
    Alert.alert(
      "Edit Task",
      `Task Number: ${task.taskNumber}\n` +
        `Details: ${task.taskDetails}\n` +
        `From: ${task.currentLocation}\n` +
        `To: ${task.destinationLocation}\n` +
        
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Edit",
          onPress: () => {
            router.push({
              pathname: "/addtask",
              params: {
                taskId: task.id,
                taskNumber: task.taskNumber,
                taskDetails: task.taskDetails,
                currentLocation: task.currentLocation,
                destinationLocation: task.destinationLocation,
                
                status: task.status,
              },
            })
          },
        },
      ],
    )
  }

  const startTaskReminder = async (task: Task) => {
    try {
      console.log(`Started Reminder for Task: ${task.taskNumber}`)
      Alert.alert(
        "Reminder Set",
        `A reminder has been set for task ${task.taskNumber}. `,
      )

      // Record that a reminder was started
      await addDoc(collection(db, "taskActions"), {
        action: "start_reminder",
        userId: auth.currentUser?.uid,
        timestamp: serverTimestamp(),
        taskId: task.id,
        taskNumber: task.taskNumber,
      })

      let reminderCount = 0

      // Set 30-minute reminder
      const reminderTimeout = setTimeout(
        () => {
          // Create an interval for 3 reminders
          const reminderInterval = setInterval(async () => {
            reminderCount++

            // Voice notification
            Speech.speak(`Reminder ${reminderCount}: ${task.taskNumber} - ${task.taskDetails}`, {
              language: "en",
              pitch: 1.0,
              rate: 0.9,
            })

            // Mobile alert notification
            Alert.alert("Task Reminder", `Reminder ${reminderCount}: ${task.taskNumber} - ${task.taskDetails}`)

            // Log to terminal/console
            console.log(`⏰ REMINDER ALERT ${reminderCount}: Task ${task.taskNumber} due now - ${task.taskDetails}`)

            // After 3 reminders, mark task as completed and clear interval
            if (reminderCount >= 3) {
              clearInterval(reminderInterval)

              // Update task status in Firestore
              const taskRef = doc(db, "tasks", task.id)
              await updateDoc(taskRef, {
                completed: true,
                status: "completed",
                completedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                completionMethod: "auto_reminder",
              })

              // Add to completedTasks collection
              await addDoc(collection(db, "completedTasks"), {
                taskId: task.id,
                taskNumber: task.taskNumber,
                userId: auth.currentUser?.uid,
                completedAt: serverTimestamp(),
                taskDetails: task.taskDetails,
                currentLocation: task.currentLocation,
                destinationLocation: task.destinationLocation,
                time: task.time,
                completionMethod: "auto_reminder",
                reminderCount: reminderCount,
              })

              // Update local state
              const updatedTasks = [...tasks]
              const index = tasks.findIndex((t) => t.id === task.id)
              if (index !== -1) {
                updatedTasks[index].completed = true
                updatedTasks[index].status = "completed"
              
                setTasks(updatedTasks)
              }

              console.log(`Task automatically completed after ${reminderCount} reminders: ${task.taskNumber}`)
              Alert.alert(
                "Task Completed",
                `${task.taskNumber} has been automatically completed after ${reminderCount} reminders.`,
              )
            }
          }, 1000) // Send a reminder every minute
        },
        30 * 60 * 1000,
      ) 
    } catch (error) {
      console.error("Error starting task reminder: ", error)
      Alert.alert("Error", "Failed to set the reminder")
    }
  }

  const getFilteredTasks = () => {
    switch (filter) {
      case "completed":
        return tasks.filter((task) => task.status === "completed")
      case "pending":
        return tasks.filter((task) => task.status === "pending")
      default:
        return tasks
    }
  }

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, item.status === "completed" ? styles.completedTaskItem : null]}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.taskNumber}</Text>
        <Checkbox
          value={item.status === "completed"}
          onValueChange={() => toggleTaskCompletion(item.id)}
          color={item.status === "completed" ? "#2ecc71" : undefined}
          style={styles.checkbox}
        />
      </View>

      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="description" size={16} color="#555" />
          <Text style={styles.detailText}>{item.taskDetails}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.detailText}>{item.currentLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="navigate-outline" size={16} color="#555" />
          <Text style={styles.detailText}>{item.destinationLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>

        {item.status === "completed" && item.completedAt && (
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#2ecc71" />
            <Text style={[styles.detailText, { color: "#2ecc71" }]}>
              Completed on {new Date(item.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.statusBadge, item.status === "completed" ? styles.completedBadge : styles.pendingBadge]}>
        <Text style={styles.statusText}>{item.status === "completed" ? "Completed" : "Pending"}</Text>
      </View>

      <View style={styles.buttonRow}>
        {item.status === "pending" && (
          <TouchableOpacity style={styles.startButton} onPress={() => startTaskReminder(item)}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editButton} onPress={() => editTask(item)}>
          <Text style={styles.startButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
          <Text style={styles.startButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="list" size={64} color="rgba(255,255,255,0.5)" />
      <Text style={styles.emptyText}>No tasks found</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/addtask")}>
        <Text style={styles.addButtonText}>Add New Task</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <LinearGradient style={styles.container} colors={["#4facfe", "#00f2fe"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.headerButtons}>
          {tasks.filter((t) => t.status === "pending").length > 0 && (
            <TouchableOpacity style={styles.completeAllButton} onPress={completeAllTasks}>
              <Ionicons name="checkmark-done" size={20} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={fetchTasks}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter((t) => t.status === "pending").length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter((t) => t.status === "completed").length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "pending" && styles.activeFilter]}
          onPress={() => setFilter("pending")}
        >
          <Text style={styles.filterText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "completed" && styles.activeFilter]}
          onPress={() => setFilter("completed")}
        >
          <Text style={styles.filterText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loaderText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredTasks()}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/addtask")}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
  },
  completeAllButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "rgba(46, 204, 113, 0.6)",
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeFilter: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  filterText: {
    color: "white",
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  taskItem: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  completedTaskItem: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderLeftWidth: 4,
    borderLeftColor: "#2ecc71",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  taskDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    color: "#555",
    fontSize: 14,
  },
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.8)",
  },
  pendingBadge: {
    backgroundColor: "rgba(241, 196, 15, 0.8)",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  startButton: {
    backgroundColor: "#2F80ED",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#2F80ED",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: "#E53E3E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
})

export default TaskList
