import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function FolderScreen({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (!token || !userStr) return;
        const user = JSON.parse(userStr);
        // Lấy id từ user lưu trong bộ nhớ
        const params = {
          creator_id: user.id,
          limit: 3,
          offset: 3,
          ordering: 'start',
          search: 'tittle',
        };
        const queryString = Object.entries(params)
          .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
          .join('&');
        const response = await fetch(`${API_URL}/assignments/?${queryString}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('GET /assignments/ status:', response.status);
        const data = await response.json();
        console.log('API response data:', data);
        const assignments = (data.results || []).map(item => ({
          id: item.id.toString(),
          name: `${item.creator_data.last_name} ${item.creator_data.first_name}`,
          title: item.title,
          start: new Date(item.start).toLocaleDateString('vi-VN'),
          deadline: new Date(item.deadline).toLocaleDateString('vi-VN'),
        }));
        console.log('Assignments after map:', assignments);
        setAssignments(assignments);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAssignments();
  }, []);

  const filtered = assignments
    .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortAsc
      ? new Date(a.deadline.split('/').reverse().join('-')) - new Date(b.deadline.split('/').reverse().join('-'))
      : new Date(b.deadline.split('/').reverse().join('-')) - new Date(a.deadline.split('/').reverse().join('-'))
    );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Assignments</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.iconBtn}>
            <Feather name="filter" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAssignment')} style={styles.iconBtn}>
            <AntDesign name="pluscircleo" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('AssignmentDetailScreen', { assignment: item })} style={{ flex: 1 }}>
            <View style={styles.card}>
              <Image source={require('../assets/icon.png')} style={styles.cardImg} />
              <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>Start: {item.start}</Text>
                <Text style={styles.cardDate}>Deadline: {item.deadline}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2d2d6a' },
  iconBtn: { marginLeft: 12 },
  card: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, margin: 8, padding: 12, elevation: 2 },
  cardImg: { width: '100%', height: 60, borderRadius: 8, marginBottom: 8, resizeMode: 'cover' },
  cardContent: {},
  cardAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  cardName: { fontWeight: 'bold', color: '#2d2d6a' },
  cardTitle: { fontWeight: 'bold', fontSize: 15, marginVertical: 2 },
  cardDate: { fontSize: 12, color: '#888' },
});