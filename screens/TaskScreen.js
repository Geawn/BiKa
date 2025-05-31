import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Animated, Easing } from 'react-native';
import TopBar from '../components/TopBar';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function TaskScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState(null);  // Thêm state role

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
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

  useEffect(() => {
    const getUserRole = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setRole(user.role);
      }
    };
    getUserRole();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (!token || !userStr) return;
      const user = JSON.parse(userStr);
      console.log('Current user role:', user.role);
      let params;
      if (user.role === 'student') {
          params = {
            assignee_id: user.id,
            creator_id: '',
            offset: 0,
            ordering: 'start',
            search: '',
          };
          console.log('Student request params:', params);
      }
      else if (user.role === 'lecturer') {
          params = {
            assignee_id: '',
            creator_id: user.id,
            offset: 0,
            ordering: 'start',
            search: '',
          };
          console.log('Lecturer request params:', params);
      }
      else {
          params = {
            offset: 0,
            ordering: 'start',
            search: '',
          }
          console.log('Other role request params:', params);
      }
      const queryString = Object.entries(params)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');
      const response = await fetch(`${API_URL}/tasks/?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setTasks(data.results || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  const filteredTasks = tasks
    .filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));

  return (
    <View style={styles.container}>
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.filterBtn} activeOpacity={0.7}>
          <Feather name="filter" size={24} color="#4f46e5" />
          <Text style={styles.sortText}>{sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4f46e5']}
              tintColor="#4f46e5"
            />
          }
          renderItem={({ item }) => (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                activeOpacity={0.8}
              >
                <View style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.assignment_data && (
                    <Text style={styles.assignmentTitle}>Assignment: {item.assignment_data.title}</Text>
                  )}
                  {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f3f4ff', 
    paddingHorizontal: 16, 
    paddingTop: 24,
    paddingBottom: 80  // Add bottom padding
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // chỉnh lại để nút thêm task không bị đẩy quá xa
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4f46e5',
    marginRight: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#aabbff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 7,
  },
  sortText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
    color: '#4f46e5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginVertical: 6,
    shadowColor: '#aabbff',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#312e81',
    marginBottom: 6,
  },
  taskDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  assignmentTitle: {
    fontSize: 14,
    color: '#4f46e5',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  separator: {
    height: 10,
  },
});
