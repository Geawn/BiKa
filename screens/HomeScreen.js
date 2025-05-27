import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const HomeScreen = () => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState([
    { id: '1', title: 'PPL', date: new Date(2023, 7, 22) },
    { id: '2', title: '8/3', date: new Date(2023, 7, 20) },
    { id: '3', title: 'Mail cho Khoa', date: new Date(2023, 7, 18) },
    { id: '4', title: 'Làm Quizz GT2', date: new Date(2023, 7, 15) },
  ]);
  const [sortAscending, setSortAscending] = useState(false);

  // Fetch completion percentage from API
  useEffect(() => {
    const fetchCompletionPercentage = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock data - replace with actual API call
        const mockApiResponse = { percentage: 75 };
        setCompletionPercentage(mockApiResponse.percentage);
      } catch (error) {
        console.error('Error fetching completion percentage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionPercentage();
  }, []);

  // Sort recent items by date
  const sortedItems = [...recentItems].sort((a, b) => {
    return sortAscending 
      ? a.date.getTime() - b.date.getTime() 
      : b.date.getTime() - a.date.getTime();
  });

  // Format date as "Day MONTH" (e.g., "22 MAR")
  const formatDate = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const day = date.getDate();
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    
    return `${day}\n${dayName}`;
  };

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  const renderDateItem = ({ item }) => (
    <View style={styles.dateItem}>
      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
    </View>
  );

  const renderRecentItem = ({ item }) => (
    <View style={styles.recentItem}>
      <Text style={styles.recentItemText}>+ {item.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <FlatList
          horizontal
          data={[
            { date: new Date(2023, 7, 22) },
            { date: new Date(2023, 7, 23) },
            { date: new Date(2023, 7, 24) },
            { date: new Date(2023, 7, 25) },
            { date: new Date(2023, 7, 26) },
            { date: new Date(2023, 7, 27) },
          ]}
          renderItem={renderDateItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.calendarList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Completion Percentage */}
      <View style={styles.percentageContainer}>
        <Text style={styles.percentageText}>{completionPercentage}%</Text>
        <Text style={styles.completedText}>Tasks Completed</Text>
      </View>

      {/* Recent Items Section */}
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Items</Text>
          <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
            <AntDesign name={sortAscending ? "arrowup" : "arrowdown"} size={16} color="black" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={sortedItems}
          renderItem={renderRecentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recentList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarList: {
    paddingHorizontal: 8,
  },
  dateItem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  completedText: {
    fontSize: 16,
    color: '#666',
  },
  recentContainer: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sortButton: {
    padding: 8,
  },
  recentList: {
    paddingBottom: 16,
  },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentItemText: {
    fontSize: 16,
  },
});

export default HomeScreen;