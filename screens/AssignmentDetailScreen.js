import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator, Alert, Platform, Modal, ScrollView
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params;
  const [assignmentData, setAssignmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
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

  const [role, setRole] = useState(null); // State lưu role

  // Lấy role user khi component mount
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
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      let url = `${API_URL}/tasks/?assignment_id=${assignment.id}`;
      
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Nếu KHÔNG phải giáo viên (hoặc role đặc biệt), luôn truyền assignee_id
        if (user.role === 'student') {
          url += `&assignee_id=${user.id}`;
        }
      }

   

      const taskRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (taskRes.ok) {
        const taskData = await taskRes.json();
     //   console.log('API Response:', taskData); // Debug log
        // Log task IDs and assignees
    
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
        setIsEditModalVisible(false);
        // Set flag in AsyncStorage to indicate assignment was updated
        await AsyncStorage.setItem('assignmentUpdated', 'true');
        Alert.alert('Thành công', 'Cập nhật assignment thành công');
      } else {
        Alert.alert('Lỗi', 'Cập nhật assignment thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật assignment');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa assignment này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert('Lỗi', 'Bạn cần đăng nhập lại');
                return;
              }
              const response = await fetch(`${API_URL}/assignments/${assignment.id}/`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (!response.ok) throw new Error();
              Alert.alert('Thành công', 'Đã xóa assignment');
              navigation.navigate('MainApp', {
                screen: 'Folder',
                params: { refresh: true }
              });
            } catch {
              Alert.alert('Lỗi', 'Xóa assignment thất bại');
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

  const startEditing = () => {
    if (!assignmentData) return;
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
    setIsEditModalVisible(true);
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setEditedData(prev => ({ ...prev, start: selectedDate.toISOString() }));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setEditedData(prev => ({ ...prev, deadline: selectedDate.toISOString() }));
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={28} color="#4f46e5" />
        </TouchableOpacity>
        {isEditModalVisible ? (
          <TextInput
            style={[styles.title, styles.editInput]}
            value={editedData.title}
            onChangeText={text => setEditedData({ ...editedData, title: text })}
            editable={true}
          />
        ) : (
          <Text style={styles.title}>{assignmentData?.title || assignment.title}</Text>
        )}
        {!isEditModalVisible && role !== 'student' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={startEditing} style={styles.editButton}>
              <Feather name="edit" size={24} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <AntDesign name="delete" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {role !== 'student' && (
          <TouchableOpacity onPress={() => navigation.navigate('CreateTaskScreen', { assignmentId: assignment.id })}>
            <AntDesign name="pluscircleo" size={26} color="#4f46e5" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderInfoSection = () => (
    <>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Description</Text>
        <TextInput
          style={[styles.infoInput, isEditModalVisible && styles.editInput]}
          value={isEditModalVisible ? editedData.description : (assignmentData?.description || '')}
          multiline
          editable={isEditModalVisible}
          onChangeText={text => isEditModalVisible && setEditedData({ ...editedData, description: text })}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Creator</Text>
        <TextInput
          style={styles.infoInput}
          value={assignmentData ? `${assignmentData.creator_data.last_name} ${assignmentData.creator_data.first_name}` : ''}
          editable={false}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Start time</Text>
        {isEditModalVisible ? (
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <TextInput
              style={[styles.infoInput, styles.editInput]}
              value={editedData.start ? formatDate(new Date(editedData.start)) : ''}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        ) : (
          <TextInput
            style={styles.infoInput}
            value={assignmentData ? formatDate(new Date(assignmentData.start)) : ''}
            editable={false}
          />
        )}
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

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>End time</Text>
        {isEditModalVisible ? (
          <TouchableOpacity onPress={() => setShowEndPicker(true)}>
            <TextInput
              style={[styles.infoInput, styles.editInput]}
              value={editedData.deadline ? formatDate(new Date(editedData.deadline)) : ''}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        ) : (
          <TextInput
            style={styles.infoInput}
            value={assignmentData ? formatDate(new Date(assignmentData.deadline)) : ''}
            editable={false}
          />
        )}
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

  const renderFooter = () => (
    <>
      {/* Divider line */}
      <View style={styles.divider} />

      {renderInfoSection()}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        contentContainerStyle={styles.contentContainer}
      />
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Assignment</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <AntDesign name="close" size={26} color="#4f46e5" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.input, styles.largeInput]}
                value={editedData?.title}
                onChangeText={text => setEditedData(prev => ({ ...prev, title: text }))}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.largeTextArea]}
                value={editedData?.description}
                onChangeText={text => setEditedData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={6}
              />

              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput]} 
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{editedData?.start ? formatDate(new Date(editedData.start)) : 'Select start time'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput]} 
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{editedData?.deadline ? formatDate(new Date(editedData.deadline)) : 'Select end time'}</Text>
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

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleUpdateAssignment}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingBottom: 16 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
   
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4f46e5',
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 20,
    color: '#3730a3',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#4f46e5',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    padding: 12,
    marginBottom: 14,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: 6,
    fontSize: 16,
  },
  infoInput: {
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    padding: 10,
    color: '#3730a3',
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  taskItem: {
    backgroundColor: '#eef2ff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#4f46e5',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#c7d2fe',
    marginVertical: 20,
    borderRadius: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(79, 70, 229, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4f46e5',
  },
  modalScroll: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
    color: '#4f46e5',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#3730a3',
    fontSize: 15,
    marginBottom: 16,
  },
  largeInput: {
    height: 50,
    fontSize: 16,
  },
  largeTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateInput: {
    justifyContent: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});
