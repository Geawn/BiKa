import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, TextInput, Image, Animated, Easing 
} from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../config/api';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  const animatePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };
  const animatePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const fetchTasks = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        alert('User data not found');
        return;
      }
      const user = JSON.parse(userData);
      const response = await fetch(`${API_ENDPOINTS.TASKS}?offset=0&assignee_id=${user.id}&limit=7&ordering=created`);
      const data = await response.json();
      setTasks(data.results);
    } catch {
      alert('Failed to fetch tasks');
    }
  };

  const fetchCompletionPercentage = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.TASK_COMPLETION_PERCENTAGE);
      const data = await response.json();
      setCompletionPercentage(parseFloat(data.percent_completed));
    } catch {
      alert('Failed to fetch completion percentage');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompletionPercentage();
      fetchTasks();
    }, [])
  );

  useEffect(() => {
    fetchCompletionPercentage();
    fetchTasks();
  }, []);

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.created);
    const dateB = new Date(b.created);
    return sortAscending ? dateA - dateB : dateB - dateA;
  });

  const getDateRange = () => {
    const today = new Date();
    const days = [];
    const totalDays = 21; // 3 weeks for a broader range
    const startOffset = -10; // Start 10 days before today to center it

    for (let i = startOffset; i < startOffset + totalDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        date: d,
        isToday: today.toDateString() === d.toDateString(),
      });
    }
    console.log('Date Range:', days.map(item => ({
      date: item.date.toDateString(),
      isToday: item.isToday
    }))); // Debugging log
    return days;
  };

  const moveWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
    const newSelectedDate = new Date(selectedDate);
    newSelectedDate.setDate(newSelectedDate.getDate() + direction * 7);
    setSelectedDate(newSelectedDate);
    const dateRange = getDateRange();
    const index = dateRange.findIndex(item => item.date.toDateString() === newSelectedDate.toDateString());
    if (index !== -1 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      } catch (error) {
        console.error('Error scrolling to index in moveWeek:', error);
      }
    }
  };

  const onDatePress = (date) => {
    animatePressIn();
    setTimeout(() => {
      setSelectedDate(date);
      animatePressOut();
      const dateRange = getDateRange();
      const index = dateRange.findIndex(item => item.date.toDateString() === date.toDateString());
      if (index !== -1 && flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        } catch (error) {
          console.error('Error scrolling to index in onDatePress:', error);
        }
      }
    }, 100);
  };

  // Scroll to today's date after loading
  useEffect(() => {
    if (!loading && flatListRef.current) {
      const dateRange = getDateRange();
      const todayIndex = dateRange.findIndex(item => item.isToday);
      console.log('Today Index:', todayIndex, 'Date Range Length:', dateRange.length); // Debugging log
      if (todayIndex !== -1) {
        setTimeout(() => {
          try {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({ index: todayIndex, animated: false, viewPosition: 0.5 });
              console.log('Scrolled to todayIndex:', todayIndex); // Debugging log
            } else {
              console.warn('flatListRef.current is null in useEffect');
            }
          } catch (error) {
            console.error('Error scrolling to todayIndex:', error);
          }
        }, 300); // Increased delay for Hermes
      }
    }
  }, [loading]);

  // Define item layout for efficient scrolling
  const getItemLayout = (data, index) => ({
    length: 72, // Width of dateItem (56) + marginHorizontal (8 + 8)
    offset: 72 * index,
    index,
  });

  const todayIndex = getDateRange().findIndex(item => item.isToday);

  const handleAvatarPress = () => navigation.navigate('UserScreen');
  const handleMenuPress = () => navigation.navigate('SettingsScreen');
  const toggleSort = () => setSortAscending(!sortAscending);
  const handleReload = () => fetchTasks();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton} activeOpacity={0.8}>
            <MaterialIcons name="more-vert" size={28} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.monthText}>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        <View style={styles.calendarRow}>
          <TouchableOpacity onPress={() => moveWeek(-1)} activeOpacity={0.7}>
            <AntDesign name="leftcircle" size={30} color="#6366f1" />
          </TouchableOpacity>
          <FlatList
            ref={flatListRef}
            horizontal
            data={getDateRange()}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedDate.toDateString() === item.date.toDateString();
              return (
                <Animated.View style={{ transform: [{ scale: isSelected ? scaleAnim : 1 }] }}>
                  <TouchableOpacity
                    style={[
                      styles.dateItem,
                      item.isToday && styles.todayItem,
                      isSelected && styles.selectedItem,
                    ]}
                    onPress={() => onDatePress(item.date)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateText, item.isToday && styles.todayText, isSelected && styles.selectedText]}>
                      {item.date.getDate()}
                    </Text>
                    <Text style={[styles.dayText, item.isToday && styles.todayText, isSelected && styles.selectedText]}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item.date.getDay()]}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            getItemLayout={getItemLayout}
            initialScrollIndex={todayIndex >= 0 ? todayIndex : undefined}
          />
          <TouchableOpacity onPress={() => moveWeek(1)} activeOpacity={0.7}>
            <AntDesign name="rightcircle" size={30} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.completionContainer}>
        <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
        <Text style={styles.completionLabel}>Tasks Completed</Text>
      </View>

      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Items</Text>
          <View style={styles.recentButtons}>
            <TouchableOpacity onPress={handleReload} style={styles.reloadBtn} activeOpacity={0.7}>
              <AntDesign name="reload1" size={22} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSort} style={styles.sortBtn} activeOpacity={0.7}>
              <AntDesign name={sortAscending ? 'arrowup' : 'arrowdown'} size={22} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={sortedTasks}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.taskItem}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.taskText}>+ {item.title}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#5b5fff22',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#4f46e5',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  menuButton: {
    padding: 8,
  },
  calendarContainer: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginBottom: 26,
    shadowColor: '#aabbff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 9,
  },
  monthText: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    marginLeft: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: {
    width: 56,
    height: 78,
    borderRadius: 28,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#999',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  todayItem: {
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 14,
  },
  selectedItem: {
    backgroundColor: '#818cf8',
    shadowColor: '#818cf8',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  dayText: {
    fontSize: 14,
    color: '#818cf8',
    fontWeight: '700',
  },
  todayText: {
    color: '#fff',
  },
  selectedText: {
    color: '#fff',
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  completionPercentage: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  completionLabel: {
    fontSize: 18,
    color: '#4b5563',
    fontWeight: '600',
  },
  recentContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  recentButtons: {
    flexDirection: 'row',
  },
  reloadBtn: {
    marginRight: 16,
    padding: 8,
  },
  sortBtn: {
    padding: 8,
  },
  taskItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    backgroundColor: '#fefefe',
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 4,
    shadowColor: '#aabbff',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  taskText: {
    fontSize: 18,
    color: '#3b3f72',
    fontWeight: '600',
  },
});

export default HomeScreen;