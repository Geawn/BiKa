import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
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
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user ID from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.log('Error fetching user ID:', error);
      }
    };
    getUserId();
  }, []);

  // Đưa fetchTasks ra ngoài useEffect để có thể gọi lại khi cần
  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Bắt đầu lấy token từ AsyncStorage...');
      const token = await AsyncStorage.getItem('token');
      console.log('Token lấy được:', token ? '[Đã có token]' : '[Không có token]');
      console.log('Gọi API /tasks/?offset=0 ...');
      const response = await fetch(`${API_URL}/tasks/?offset=0`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Đã nhận response từ API, status:', response.status);
      const data = await response.json();
      const mappedTasks = (data.results || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        assignee_id: userId, // Thêm assignee_id từ userId đã lưu
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.log('Lỗi khi fetch tasks:', error);
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

  // Lọc và sắp xếp task
  const filteredTasks = tasks
    .filter(
      task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortAsc) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd', paddingHorizontal: 16, paddingTop: 24 }}>
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.filterBtn}>
          <Feather name="filter" size={22} color="#2d2d6a" />
          <Text style={styles.sortText}>{sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2d2d6a']}
              tintColor="#2d2d6a"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { id: item.id })}>
              <View style={styles.taskItem}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskDesc}>{item.description}</Text>
                {/* Có thể hiển thị status nếu muốn */}
                {/* <Text style={{color: '#888', fontSize: 12}}>{item.status}</Text> */}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d2d6a',
    marginLeft: 2,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0fa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sortText: {
    marginLeft: 6,
    color: '#2d2d6a',
    fontWeight: 'bold',
    fontSize: 13,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d2d6a',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 13,
    color: '#6b6b8d',
  },
  separator: {
    height: 8,
  },
}); 