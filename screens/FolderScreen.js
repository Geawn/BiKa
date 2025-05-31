import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, RefreshControl, Dimensions
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const screenWidth = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 32;
const ITEM_MARGIN = 12;
const NUM_COLUMNS = 2;
const cardWidth = (screenWidth - HORIZONTAL_PADDING - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function FolderScreen({ navigation, route }) {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (!token || !userStr) return;
      const user = JSON.parse(userStr);
      const params = {
        creator_id: user.id,
        limit: 10,
        offset: 0,
        ordering: 'start',
        search: '',
      };
      const queryString = Object.entries(params)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');
      const response = await fetch(`${API_URL}/assignments/?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const assignments = (data.results || []).map(item => ({
        id: item.id.toString(),
        name: `${item.creator_data.last_name} ${item.creator_data.first_name}`,
        title: item.title,
        start: new Date(item.start).toLocaleDateString('vi-VN'),
        deadline: new Date(item.deadline).toLocaleDateString('vi-VN'),
      }));
      setAssignments(assignments);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (route.params?.refresh) {
      fetchAssignments();
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filtered = assignments
    .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortAsc
      ? new Date(a.deadline.split('/').reverse().join('-')) - new Date(b.deadline.split('/').reverse().join('-'))
      : new Date(b.deadline.split('/').reverse().join('-')) - new Date(a.deadline.split('/').reverse().join('-'))
    );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAssignments().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Assignments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.iconBtn}>
            <Feather name="filter" size={24} color="#4f46e5" />
            <Text style={styles.sortText}>{sortAsc ? 'Oldest' : 'Newest'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAssignment')} style={styles.iconBtn}>
            <AntDesign name="pluscircleo" size={26} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        renderItem={({ item, index }) => {
          const marginRight = (index + 1) % NUM_COLUMNS === 0 ? 0 : ITEM_MARGIN;
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('AssignmentDetailScreen', { assignment: item })}
              style={[styles.cardWrapper, { width: cardWidth, marginRight }]}
              activeOpacity={0.8}
            >
              <View style={styles.card}>
                <Image source={require('../assets/assignment.png')} style={styles.cardImg} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardDate}>Start: {item.start}</Text>
                  <Text style={styles.cardDate}>Deadline: {item.deadline}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff', paddingHorizontal: 16, paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#4f46e5' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    backgroundColor: '#eef2ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sortText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#4f46e5',
    fontSize: 14,
  },
  cardWrapper: {
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    backgroundColor: '#f9fafb',
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 6,
    fontSize: 14,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748b',
  },
});
