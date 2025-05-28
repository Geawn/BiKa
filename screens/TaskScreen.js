import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import TopBar from '../components/TopBar';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const tasks = [
  {
    id: '1',
    title: 'Phần 1.1 - Lịch sử Đảng',
    description: 'Nghị quyết Đại hội Đại biểu toàn quốc lần thứ Nhất (3-1935)',
  },
  {
    id: '2',
    title: 'Hoàn thành Lexer - PPL',
    description: 'Xây dựng bộ phân tích từ vựng (Lexical analysis)',
  },
  {
    id: '3',
    title: 'Hoàn thành AST Generation - PPL',
    description: 'Xây dựng cây cú pháp trừu tượng',
  },
  {
    id: '4',
    title: 'Ôn thi Giữa kỳ PPL',
    description: 'Ôn tập các phần trong thi giữa kỳ',
  },
  {
    id: '5',
    title: 'Làm Figma cho Mobile 2',
    description: 'Hoàn chỉnh UI/UX cho Bika App',
  },
  {
    id: '6',
    title: 'Mobile 3: ReactNative',
    description: 'Nhóm bắt đầu nghiên cứu và tìm hiểu ReactNative',
  },
];

export default function TaskScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Lọc và sắp xếp task
  const filteredTasks = tasks
    .filter(
      task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Nếu có trường date thì thay bằng a.date - b.date hoặc b.date - a.date
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
        onAvatarPress={() => {}}
        onMenuPress={() => {}}
      />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.filterBtn}>
          <Feather name="filter" size={22} color="#2d2d6a" />
          <Text style={styles.sortText}>{sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { task: item })}>
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
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