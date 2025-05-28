import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
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

  const statusOptions = [
    { value: 'backlog', label: 'In Backlog' },
    { value: 'ready', label: 'Ready' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'ready_for_review', label: 'Ready for Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' }
  ];

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found');
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

        if (!response.ok) {
          console.error('Failed to fetch task. Status:', response.status);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
      //  console.log('Task data loaded:', data);
        setTask(data);
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Không thể tải dữ liệu task.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  const formatDate = (date) => {
    console.log('Formatting date:', date);
    const formatted = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    console.log('Formatted date:', formatted);
    return formatted;
  };

  const onStartDateChange = (event, selectedDate) => {
    console.log('Start date picker event:', event);
    console.log('Selected start date:', selectedDate);
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      const updatedTask = {
        ...editedTask,
        start: selectedDate.toISOString()
      };
      console.log('Updated task with new start date:', updatedTask);
      setEditedTask(updatedTask);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    console.log('End date picker event:', event);
    console.log('Selected end date:', selectedDate);
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      const updatedTask = {
        ...editedTask,
        end: selectedDate.toISOString()
      };
      console.log('Updated task with new end date:', updatedTask);
      setEditedTask(updatedTask);
    }
  };

  const handleEdit = () => {
    console.log('Starting edit mode with task:', task);
    const start = new Date(task.start);
    const end = new Date(task.end);
    console.log('Parsed dates - Start:', start, 'End:', end);
    setStartDate(start);
    setEndDate(end);
    const initialEditData = {
      ...task,
      start: task.start,
      end: task.end
    };
    console.log('Initial edit data:', initialEditData);
    setEditedTask(initialEditData);
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    //console.log('Saving task with data:', editedTask);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const requestBody = {
        assignment: task.assignment,
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        start: editedTask.start,
        end: editedTask.end
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(`${API_URL}/tasks/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error('Failed to update task. Status:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      console.log('Task updated successfully:', updatedTask);
      setTask(updatedTask);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#2d2d6a" /></View>;
  }
  if (error) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{error}</Text></View>;
  }
  if (!task) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Không tìm thấy task</Text></View>;
  }

  // Lấy các trường cần thiết
  const status = task.status || '';
  const assignedTo = task.assignee_data?.email || '';
  const description = task.description || '';
  const startTime = task.start ? new Date(task.start).toLocaleString() : '';
  const endTime = task.end ? new Date(task.end).toLocaleString() : '';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      <TopBar
        searchQuery={''}
        setSearchQuery={() => {}}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
        </TouchableOpacity>
        <Text style={styles.title}>{task.title}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <AntDesign name="edit" size={24} color="#2d2d6a" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Assigned to:</Text>
          <TextInput style={styles.input} value={assignedTo} editable={false} />
        </View>
        <Text style={styles.label}>Description</Text>
        <View style={styles.descBox}>
          <Text style={styles.descText}>{description}</Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <AntDesign name="close" size={24} color="#2d2d6a" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.input, styles.largeInput]}
                value={editedTask?.title}
                onChangeText={(text) => setEditedTask({...editedTask, title: text})}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.largeTextArea]}
                value={editedTask?.description}
                onChangeText={(text) => setEditedTask({...editedTask, description: text})}
                multiline
                numberOfLines={6}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.statusContainer}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      editedTask?.status === option.value && styles.selectedStatus
                    ]}
                    onPress={() => setEditedTask({...editedTask, status: option.value})}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      editedTask?.status === option.value && styles.selectedStatusText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{editedTask?.start ? formatDate(new Date(editedTask.start)) : 'Select start time'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity 
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{editedTask?.end ? formatDate(new Date(editedTask.end)) : 'Select end time'}</Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                  onError={(error) => console.error('Start date picker error:', error)}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                  onError={(error) => console.error('End date picker error:', error)}
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d6a',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#2d2d6a',
    width: 110,
    fontSize: 15,
  },
  statusBox: {
    backgroundColor: '#2ecc40',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginLeft: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 6,
    backgroundColor: '#f4f4f4',
    color: '#2d2d6a',
    fontSize: 14,
  },
  descBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f4f4f4',
    marginBottom: 16,
  },
  descText: {
    color: '#2d2d6a',
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  largeInput: {
    height: 50,
    fontSize: 16,
    padding: 12,
  },
  largeTextArea: {
    height: 120,
    fontSize: 16,
    padding: 12,
    textAlignVertical: 'top',
  },
  dateInput: {
    height: 50,
    justifyContent: 'center',
    padding: 12,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d2d6a',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusOption: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d2d6a',
    margin: 4,
  },
  selectedStatus: {
    backgroundColor: '#2d2d6a',
  },
  statusOptionText: {
    color: '#2d2d6a',
  },
  selectedStatusText: {
    color: 'white',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f4f4f4',
  },
  cancelButtonText: {
    color: '#2d2d6a',
  },
  saveButton: {
    backgroundColor: '#2d2d6a',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 