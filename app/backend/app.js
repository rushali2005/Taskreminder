import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import * as Location from 'expo-location';


export default function App() {
  const [task, setTask] = useState('');
  const [reminderCount, setReminderCount] = useState('');
  const [tasks, setTasks] = useState([]);
  const [location, setLocation] = useState(null);


  useEffect(() => {
    fetchTasks();
    getLocation();
  }, []);


  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }


    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };


  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };


  const addTask = async () => {
    try {
      const response = await fetch('http://localhost:5000/add_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: task,
          reminder_count: parseInt(reminderCount),
        }),
      });
      if (response.ok) {
        setTask('');
        setReminderCount('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPS Task Reminder</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={setTask}
      />
      <TextInput
        style={styles.input}
        placeholder="Number of reminders"
        value={reminderCount}
        onChangeText={setReminderCount}
        keyboardType="numeric"
      />
      <Button title="Add Task" onPress={addTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.task} - Reminders left: {item.reminder_count}</Text>
          </View>
        )}
      />
      {location && (
        <Text style={styles.locationText}>
          Current location: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  taskItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  locationText: {
    marginTop: 20,
    fontStyle: 'italic',
  },
});
