import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import TopBar from '../components/TopBar';

export default function FolderScreen({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    // Gọi API thật ở đây, ví dụ:
    // fetch('API_URL').then(res => res.json()).then(setAssignments);
    // Dưới đây là mock data:
    setAssignments([
      {
        id: '1',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        name: 'Trần Ngọc Bảo Duy',
        title: 'PPL Assignment 1',
        start: '24/03/2025',
        deadline: '24/05/2025',
      },
      {
        id: '2',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        name: 'Nguyễn Hòa Phụng',
        title: 'PPL Extends',
        start: '30/03/2025',
        deadline: '30/05/2025',
      },
      {
        id: '3',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        name: 'Hoàng Lê Hải Thanh',
        title: 'Mobile Assignment 1',
        start: '01/04/2025',
        deadline: '15/04/2025',
      },
      {
        id: '4',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        name: 'Hoàng Lê Hải Thanh',
        title: 'Mobile Assignment 2',
        start: '15/04/2025',
        deadline: '20/04/2025',
      },
    ]);
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
                  <Image source={{ uri: item.avatar }} style={styles.cardAvatar} />
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