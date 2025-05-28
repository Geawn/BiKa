import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params;
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/assignments/${assignment.id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAssignmentData(data);
          // TODO: Fetch tasks for this assignment
          // For now using mock data
          setTasks([
            { id: '1', title: 'Hoàn thành Lexer - PPL', desc: 'Xây dựng bộ phân tích từ vựng (Lexical analysis)' },
            { id: '2', title: 'Hoàn thành AST Generation - PPL', desc: 'Xây dựng cây cú pháp trừu tượng' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching assignment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [assignment.id]);

  const renderHeader = () => (
    <>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
        </TouchableOpacity>
        <Text style={styles.title}>{assignmentData?.title || assignment.title}</Text>
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTaskScreen')}>
          <AntDesign name="pluscircleo" size={20} color="#2d2d6a" />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderInfoSection = () => (
    <>
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Description</Text>
          <TouchableOpacity>
            <Feather name="edit" size={18} color="#2d2d6a" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.infoInput}
          value={assignmentData?.description || ''}
          multiline
          editable={false}
        />
      </View>
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creator</Text>
          <TouchableOpacity>
            <Feather name="edit" size={18} color="#2d2d6a" />
          </TouchableOpacity>
        </View>
        <TextInput 
          style={styles.infoInput} 
          value={assignmentData ? `${assignmentData.creator_data.last_name} ${assignmentData.creator_data.first_name}` : ''} 
          editable={false} 
        />
      </View>
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Start time:</Text>
          <TouchableOpacity>
            <Feather name="edit" size={18} color="#2d2d6a" />
          </TouchableOpacity>
        </View>
        <TextInput 
          style={styles.infoInput} 
          value={assignmentData ? new Date(assignmentData.start).toLocaleDateString('vi-VN') : ''} 
          editable={false} 
        />
      </View>
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>End time:</Text>
          <TouchableOpacity>
            <Feather name="edit" size={18} color="#2d2d6a" />
          </TouchableOpacity>
        </View>
        <TextInput 
          style={styles.infoInput} 
          value={assignmentData ? new Date(assignmentData.deadline).toLocaleDateString('vi-VN') : ''} 
          editable={false} 
        />
      </View>
    </>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { task: item })}>
      <View style={styles.taskItem}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDesc}>{item.desc}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => renderInfoSection();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2d2d6a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <TopBar
        searchQuery={''}
        setSearchQuery={() => {}}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 8,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2d2d6a',
    flex: 1,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#2d2d6a', marginRight: 8 },
  taskList: { backgroundColor: '#f1f5f9', borderRadius: 8, marginBottom: 16 },
  taskItem: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 10 },
  taskTitle: { fontWeight: 'bold', color: '#2d2d6a' },
  taskDesc: { color: '#666', fontSize: 13 },
  infoBox: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', padding: 10, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  infoLabel: { fontWeight: 'bold', color: '#2d2d6a' },
  infoInput: { backgroundColor: '#f8fafc', borderRadius: 6, padding: 8, color: '#222', marginTop: 2 },
}); 