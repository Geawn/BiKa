import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params;
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    title: '',
    description: '',
    start: '',
    deadline: ''
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const taskRes = await fetch(
        `${API_URL}/tasks/?assignment_id=${assignment.id}&limit=10&offset=0`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTasks(
          taskData.results.map(task => ({
            id: String(task.id),
            title: task.title,
            desc: task.description,
            ...task,
          }))
        );
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

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
        console.log('Assignment title:', data.title);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
      fetchAssignmentDetail();
    }, [])
  );

  useEffect(() => {
    fetchAssignmentDetail();
    fetchTasks();
  }, [assignment.id]);

  const handleUpdateAssignment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/assignments/${assignment.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator: assignmentData.creator,
          title: editedData.title,
          description: editedData.description,
          start: editedData.start,
          deadline: editedData.deadline
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAssignmentData(updatedData);
        setIsEditing(false);
        Alert.alert('Success', 'Assignment updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      Alert.alert('Error', 'An error occurred while updating the assignment');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa assignment này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert('Error', 'Authentication required');
                return;
              }

              const response = await fetch(`${API_URL}/assignments/${assignment.id}/`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete assignment');
              }

              Alert.alert('Success', 'Assignment deleted successfully');
              navigation.navigate('MainApp', {
                screen: 'Folder',
                params: { refresh: true }
              });
            } catch (error) {
              console.error('Error deleting assignment:', error);
              Alert.alert('Error', 'Failed to delete assignment');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setEditedData({
        ...editedData,
        start: selectedDate.toISOString()
      });
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setEditedData({
        ...editedData,
        deadline: selectedDate.toISOString()
      });
    }
  };

  const startEditing = () => {
    const start = new Date(assignmentData.start);
    const end = new Date(assignmentData.deadline);
    setStartDate(start);
    setEndDate(end);
    setEditedData({
      title: assignmentData.title,
      description: assignmentData.description,
      start: assignmentData.start,
      deadline: assignmentData.deadline
    });
    setIsEditing(true);
  };

  const renderHeader = () => (
    <>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={[styles.title, styles.editInput]}
            value={editedData.title}
            onChangeText={(text) => setEditedData({...editedData, title: text})}
          />
        ) : (
          <Text style={styles.title}>{assignmentData?.title || assignment.title}</Text>
        )}
        {!isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={startEditing} style={styles.editButton}>
              <Feather name="edit" size={20} color="#2d2d6a" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <AntDesign name="delete" size={20} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTaskScreen', { assignmentId: assignment.id })}>
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
        </View>
        <TextInput
          style={[styles.infoInput, isEditing && styles.editInput]}
          value={isEditing ? editedData.description : (assignmentData?.description || '')}
          multiline
          editable={isEditing}
          onChangeText={(text) => isEditing && setEditedData({...editedData, description: text})}
        />
      </View>
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creator</Text>
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
        </View>
        {isEditing ? (
          <View>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                style={[styles.infoInput, styles.editInput]}
                value={editedData.start ? formatDate(new Date(editedData.start)) : ''}
                placeholder="DD/MM/YYYY"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        ) : (
          <TextInput 
            style={styles.infoInput} 
            value={assignmentData ? formatDate(new Date(assignmentData.start)) : ''} 
            editable={false} 
          />
        )}
      </View>
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>End time:</Text>
        </View>
        {isEditing ? (
          <View>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                style={[styles.infoInput, styles.editInput]}
                value={editedData.deadline ? formatDate(new Date(editedData.deadline)) : ''}
                placeholder="DD/MM/YYYY"
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}
          </View>
        ) : (
          <TextInput 
            style={styles.infoInput} 
            value={assignmentData ? formatDate(new Date(assignmentData.deadline)) : ''} 
            editable={false} 
          />
        )}
      </View>
      {isEditing && (
        <View style={styles.editButtons}>
          <TouchableOpacity 
            style={[styles.editButton, styles.saveButton]} 
            onPress={handleUpdateAssignment}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.editButton, styles.cancelButton]} 
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { id: item.id })}>
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
  editInput: {
    borderWidth: 1,
    borderColor: '#2d2d6a',
    backgroundColor: '#fff',
    padding: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#2d2d6a',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 