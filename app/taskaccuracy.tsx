import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PieChart } from 'react-native-chart-kit';

interface TaskSummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  accuracy_percentage: number;
  completion_by_day: Record<string, number>;
  recent_completions: number;
}

const TaskAccuracy = () => {
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskSummary();
  }, []);

  const fetchTaskSummary = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Query tasks collection
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      
      // Calculate statistics
      let totalTasks = 0;
      let completedTasks = 0;
      let pendingTasks = 0;
      const completionByDay: Record<string, number> = {};
      let recentCompletions = 0;
      
      // Get current date for recent completions (last 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      querySnapshot.forEach((doc) => {
        const taskData = doc.data();
        totalTasks++;
        
        if (taskData.status === 'completed' || taskData.completed === true) {
          completedTasks++;
          
          // Track completion by day
          if (taskData.completedAt) {
            const completionDate = taskData.completedAt.toDate ? 
              taskData.completedAt.toDate() : 
              new Date(taskData.completedAt);
            
            const dateString = completionDate.toISOString().split('T')[0];
            completionByDay[dateString] = (completionByDay[dateString] || 0) + 1;
            
            // Check if completion is recent (within last 7 days)
            if (completionDate >= sevenDaysAgo) {
              recentCompletions++;
            }
          }
        } else {
          pendingTasks++;
        }
      });
      
      // Calculate accuracy percentage
      const accuracyPercentage = totalTasks > 0 ? 
        Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Set summary data
      setSummary({
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        accuracy_percentage: accuracyPercentage,
        completion_by_day: completionByDay,
        recent_completions: recentCompletions
      });
      
    } catch (err) {
      console.error("Error fetching task summary: ", err);
      setError("Failed to load task summary");
    } finally {
      setLoading(false);
    }
  };

  // Get the screen width for the chart
  const screenWidth = Dimensions.get('window').width - 40;

  // Prepare chart data
  const chartData = summary ? [
    {
      name: 'Completed',
      population: summary.completed_tasks,
      color: '#2ecc71',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    },
    {
      name: 'Pending',
      population: summary.pending_tasks,
      color: '#f1c40f',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    }
  ] : [];

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <LinearGradient style={styles.container} colors={['#4facfe', '#00f2fe']}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Task Completion Summary</Text>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loaderText}>Loading task statistics...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : summary ? (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statTitle}>Task Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Tasks:</Text>
                <Text style={styles.statValue}>{summary.total_tasks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completed Tasks:</Text>
                <Text style={[styles.statValue, styles.completedText]}>{summary.completed_tasks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pending Tasks:</Text>
                <Text style={[styles.statValue, styles.pendingText]}>{summary.pending_tasks}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completion Rate:</Text>
                <Text style={[
                  styles.statValue, 
                  summary.accuracy_percentage >= 70 ? styles.goodRate :
                  summary.accuracy_percentage >= 40 ? styles.mediumRate : styles.lowRate
                ]}>
                  {summary.accuracy_percentage}%
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Recent Completions:</Text>
                <Text style={styles.statValue}>{summary.recent_completions} (last 7 days)</Text>
              </View>
            </View>

            <Text style={styles.chartHeader}>Task Completion Distribution</Text>

            {summary.total_tasks > 0 ? (
              <View style={styles.chartContainer}>
                <PieChart
                  data={chartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No tasks available to display chart</Text>
              </View>
            )}

            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>Task Insights</Text>
              <Text style={styles.insightsText}>
                {summary.accuracy_percentage >= 70 
                  ? "Great job! You're completing tasks at an excellent rate."
                  : summary.accuracy_percentage >= 40
                  ? "You're making good progress on your tasks."
                  : "You have several pending tasks that need attention."}
              </Text>
              
              {summary.recent_completions > 0 && (
                <Text style={styles.insightsText}>
                  You've completed {summary.recent_completions} tasks in the last 7 days.
                </Text>
              )}
              
              {summary.pending_tasks > 0 && (
                <Text style={styles.insightsText}>
                  You have {summary.pending_tasks} tasks waiting to be completed.
                </Text>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>No data available</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center'
  },
  header: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  loaderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16
  },
  errorContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center'
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  statLabel: {
    color: '#555',
    fontSize: 16
  },
  statValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold'
  },
  completedText: {
    color: '#2ecc71'
  },
  pendingText: {
    color: '#f1c40f'
  },
  goodRate: {
    color: '#2ecc71'
  },
  mediumRate: {
    color: '#f39c12'
  },
  lowRate: {
    color: '#e74c3c'
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10
  },
  chartHeader: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center'
  },
  noDataContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  noDataText: {
    color: '#555',
    fontSize: 16
  },
  insightsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  insightsText: {
    color: '#555',
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22
  },
  errorText: {
    color: 'white',
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    padding: 10,
    borderRadius: 5,
    overflow: 'hidden'
  }
});

export default TaskAccuracy;