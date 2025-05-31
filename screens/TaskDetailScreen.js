import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, ActivityIndicator, Modal, Alert, Platform
} from 'react-native';
import TopBar from '../components/TopBar';
import { AntDesign } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TaskDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [assignee, setAssignee] = useState('');
  const [role, setRole] = useState(null);  // Thêm state role

  const statusOptions = [
    { value: 'backlog', label: 'In Backlog' },
    { value: 'ready', label: 'Ready' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'ready_for_review', label: 'Ready for Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' }
  ];

  useEffect(() => {
    // Lấy role user
    const getUserRole = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setRole(user.role);
      }
    };
    getUserRole();
  }, []);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_URL}/tasks/${id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch task');
        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError('Không thể tải dữ liệu task.');
      } finally {
        setLoading(false);
      }
    };
    fetchTaskDetail();
  }, [id]);

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
      setEditedTask(prev => ({ ...prev, start: selectedDate.toISOString() }));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setEditedTask(prev => ({ ...prev, end: selectedDate.toISOString() }));
    }
  };

  const handleEdit = () => {
    const start = new Date(task.start);
    const end = new Date(task.end);
    setStartDate(start);
    setEndDate(end);
    setAssignee(task.assignee || '');
    setEditedTask({
      ...task,
      start: task.start,
      end: task.end
    });
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }
      const requestBody = {
        assignment: task.assignment,
        assignee,
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        start: editedTask.start,
        end: editedTask.end
      };
      const response = await fetch(`${API_URL}/tasks/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setTask(updatedTask);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa task này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              Alert.alert('Error', 'Authentication required');
              return;
            }
            const response = await fetch(`${API_URL}/tasks/${id}/`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok) throw new Error('Failed to delete task');
            Alert.alert('Success', 'Task deleted successfully');
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete task');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy task</Text>
      </View>
    );
  }

  const status = task.status || '';
  const assignedTo = task.assignee_data?.email || '';
  const description = task.description || '';
  const startTime = task.start ? formatDate(new Date(task.start)) : '';
  const endTime = task.end ? formatDate(new Date(task.end)) : '';

  return (
    <View style={styles.screen}>
      <TopBar
        searchQuery={''}
        setSearchQuery={() => {}}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={26} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.title}>{task.title}</Text>
        {/* Ẩn nút sửa xóa nếu role là student */}
        {role !== 'student' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleEdit} style={styles.iconBtn}>
              <AntDesign name="edit" size={26} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
              <AntDesign name="delete" size={26} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <View style={[styles.statusBox, status === 'completed' ? styles.statusCompleted : styles.statusDefault]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        {task.assignment_data && (
          <View style={styles.row}>
            <Text style={styles.label}>Assignment:</Text>
            <Text style={styles.assignmentText}>{task.assignment_data.title}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Assigned to:</Text>
          <TextInput style={styles.input} value={assignedTo} editable={false} />
        </View>

        <Text style={styles.sectionLabel}>Description</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Start time:</Text>
          <TextInput style={styles.input} value={startTime} editable={false} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>End time:</Text>
          <TextInput style={styles.input} value={endTime} editable={false} />
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <AntDesign name="close" size={26} color="#4f46e5" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.input, styles.largeInput]}
                value={editedTask?.title}
                onChangeText={text => setEditedTask({ ...editedTask, title: text })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.largeTextArea]}
                value={editedTask?.description}
                onChangeText={text => setEditedTask({ ...editedTask, description: text })}
                multiline
                numberOfLines={6}
              />

              <Text style={styles.label}>Assignee ID</Text>
              <TextInput
                style={[styles.input, styles.largeInput]}
                value={assignee}
                onChangeText={setAssignee}
                keyboardType="numeric"
                placeholder="Enter assignee ID"
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      editedTask?.status === option.value && styles.statusOptionSelected
                    ]}
                    onPress={() => setEditedTask({ ...editedTask, status: option.value })}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      editedTask?.status === option.value && styles.statusOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => setShowStartPicker(true)}>
                <Text>{editedTask?.start ? formatDate(new Date(editedTask.start)) : 'Select start time'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => setShowEndPicker(true)}>
                <Text>{editedTask?.end ? formatDate(new Date(editedTask.end)) : 'Select end time'}</Text>
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
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsEditModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
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
  screen: {
    flex: 1,
    backgroundColor: '#f3f4ff',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#eef2ff',
    borderBottomWidth: 1,
    borderBottomColor: '#c7d2fe',
    marginTop: 10,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#4f46e5',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconBtn: {
    marginLeft: 16,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    width: 110,
    fontWeight: '700',
    fontSize: 15,
    color: '#4f46e5',
  },
  statusBox: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusCompleted: {
    backgroundColor: '#22c55e',
  },
  statusDefault: {
    backgroundColor: '#818cf8',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  input: {
    flex: 1,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#3730a3',
    fontSize: 15,
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 18,
    color: '#4f46e5',
    marginBottom: 8,
    marginTop: 10,
  },
  descriptionBox: {
    backgroundColor: '#e0e7ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: '#3730a3',
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
  largeInput: {
    height: 50,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
  },
  largeTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dateInput: {
    justifyContent: 'center',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  statusOptionSelected: {
    backgroundColor: '#4f46e5',
  },
  statusOptionText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: '#fff',
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
  assignmentText: {
    flex: 1,
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
