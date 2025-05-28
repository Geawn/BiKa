import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Image,
  Alert
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
  const [showMenu, setShowMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    // Bắt đầu từ Chủ nhật (0) hoặc Thứ hai (1) tuỳ ý, ở đây là Chủ nhật
    const diff = now.getDate() - day;
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        Alert.alert('Error', 'User data not found');
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.id;

      const response = await fetch(
        `${API_ENDPOINTS.TASKS}?offset=0&assignee_id=${userId}&limit=7&ordering=created`
      );
      const data = await response.json();
      setTasks(data.results);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks');
    }
  };

  // Fetch completion percentage from API
  const fetchCompletionPercentage = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.TASK_COMPLETION_PERCENTAGE);
      const data = await response.json();
      setCompletionPercentage(parseFloat(data.percent_completed));
    } catch (error) {
      console.error('Error fetching completion percentage:', error);
      Alert.alert('Error', 'Failed to fetch completion percentage');
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to reload data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchCompletionPercentage();
      fetchTasks();
    }, [])
  );

  // Initial load
  useEffect(() => {
    fetchCompletionPercentage();
    fetchTasks();
  }, []);

  // Sort tasks by date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.created);
    const dateB = new Date(b.created);
    return sortAscending 
      ? dateA.getTime() - dateB.getTime() 
      : dateB.getTime() - dateA.getTime();
  });

  // Format date as "Day MONTH" (e.g., "22 MAR")
  const formatDate = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const day = date.getDate();
    const dayName = days[date.getDay()];
    
    return `${day}\n${dayName}`;
  };

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  const handleAvatarPress = () => {
    navigation.navigate('UserScreen'); // Điều hướng đến màn hình User
  };

  const handleMenuPress = () => {
    navigation.navigate('SettingsScreen'); // Điều hướng đến màn hình Settings
  };

  // Function to get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: null });
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        date: new Date(year, month, i),
        isToday: new Date().toDateString() === new Date(year, month, i).toDateString()
      });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const renderDateItem = ({ item }) => {
    if (!item.date) {
      return <View style={[styles.dateItem, styles.emptyDateItem]} />;
    }

    const isSelected = selectedDate.toDateString() === item.date.toDateString();
    
    return (
      <TouchableOpacity 
        style={[
          styles.dateItem,
          item.isToday && styles.todayItem,
          isSelected && styles.selectedItem
        ]}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text style={[
          styles.dateText,
          item.isToday && styles.todayText,
          isSelected && styles.selectedText
        ]}>
          {item.date.getDate()}
        </Text>
        <Text style={[
          styles.dayText,
          item.isToday && styles.todayText,
          isSelected && styles.selectedText
        ]}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][item.date.getDay()]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
    >
      <Text style={styles.recentItemText}>+ {item.title}</Text>
    </TouchableOpacity>
  );

  // Lấy 7 ngày liên tiếp bắt đầu từ currentWeekStart
  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({
        date: d,
        isToday: new Date().toDateString() === d.toDateString(),
      });
    }
    return days;
  };

  const moveWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
  };

  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const renderHorizontalDateItem = ({ item }) => {
    const isSelected = selectedDate.toDateString() === item.date.toDateString();
    return (
      <TouchableOpacity
        style={[
          styles.hDateItem,
          item.isToday && styles.hTodayItem,
          isSelected && styles.hSelectedItem,
        ]}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text style={[
          styles.hDateText,
          item.isToday && styles.hTodayText,
          isSelected && styles.hSelectedText,
        ]}>{item.date.getDate()}</Text>
        <Text style={[
          styles.hDayText,
          item.isToday && styles.hTodayText,
          isSelected && styles.hSelectedText,
        ]}>{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][item.date.getDay()]}</Text>
      </TouchableOpacity>
    );
  };

  const handleReload = () => {
    fetchTasks();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search, Avatar and Menu */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
            <MaterialIcons name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Section - Horizontal */}
      <View style={styles.hCalendarContainer}>
        <Text style={styles.hMonthText}>{formatMonth(currentWeekStart)}</Text>
        <View style={styles.hCalendarRow}>
          <TouchableOpacity onPress={() => moveWeek(-1)}>
            <AntDesign name="left" size={20} color="#3366FF" />
          </TouchableOpacity>
          <FlatList
            horizontal
            data={getWeekDays(currentWeekStart)}
            renderItem={renderHorizontalDateItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.hCalendarList}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity onPress={() => moveWeek(1)}>
            <AntDesign name="right" size={20} color="#3366FF" />
          </TouchableOpacity>
        </View>
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
          <View style={styles.recentHeaderButtons}>
            <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
              <AntDesign name="reload1" size={16} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
              <AntDesign name={sortAscending ? "arrowup" : "arrowdown"} size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={sortedTasks}
          renderItem={renderRecentItem}
          keyExtractor={(item) => item.id.toString()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  menuButton: {
    padding: 4,
  },
  hCalendarContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
  },
  hMonthText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    marginLeft: 8,
  },
  hCalendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hCalendarList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  hDateItem: {
    width: 48,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTodayItem: {
    backgroundColor: '#2563eb',
  },
  hSelectedItem: {
    backgroundColor: '#60a5fa',
  },
  hDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  hDayText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  hTodayText: {
    color: '#fff',
  },
  hSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
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
  recentHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reloadButton: {
    padding: 8,
    marginRight: 8,
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