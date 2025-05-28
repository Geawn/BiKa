import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'In Backlog' },
  { value: 'ready', label: 'Ready' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready_for_review', label: 'Ready for Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

export default function CreateTaskScreen({ navigation, route }) {
  const { assignmentId } = route.params;
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('backlog');
  const [description, setDescription] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStatusPicker, setShowStatusPicker] = useState(false);

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
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleCreateTask = async () => {
    if (!title || !assignee) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignment: assignmentId,
          assignee: parseInt(assignee),
          title: title,
          description: description,
          status: status,
          start: startDate.toISOString(),
          end: endDate.toISOString()
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Task created successfully');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'An error occurred while creating the task');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
        </TouchableOpacity>
        <Text style={styles.header}>Create new task</Text>
        
        <Text style={styles.label}>Title<Text style={{color:'red'}}>*</Text></Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title" />
        
        <Text style={styles.label}>Assignee ID<Text style={{color:'red'}}>*</Text></Text>
        <TextInput 
          style={styles.input} 
          value={assignee} 
          onChangeText={setAssignee} 
          placeholder="Enter assignee ID" 
          keyboardType="numeric"
        />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start time<Text style={{color:'red'}}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(startDate)}
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
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>End time<Text style={{color:'red'}}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(endDate)}
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
        </View>

        <Text style={styles.label}>Status<Text style={{color:'red'}}>*</Text></Text>
        <TouchableOpacity 
          style={styles.statusBtn}
          onPress={() => setShowStatusPicker(true)}
        >
          <Text style={{ color: '#2d2d6a' }}>
            {STATUS_OPTIONS.find(opt => opt.value === status)?.label || 'Select Status'}
          </Text>
        </TouchableOpacity>

        {showStatusPicker && (
          <View style={styles.statusPicker}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  status === option.value && styles.selectedStatus
                ]}
                onPress={() => {
                  setStatus(option.value);
                  setShowStatusPicker(false);
                }}
              >
                <Text style={[
                  styles.statusOptionText,
                  status === option.value && styles.selectedStatusText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="..."
          multiline
          maxLength={500}
        />
        <Text style={{ alignSelf: 'flex-end', color: '#888', marginBottom: 8 }}>{description.length} / 500</Text>
        
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateTask}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Create</Text>
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <AntDesign name="solution1" size={80} color="#2d2d6a" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: 'bold', color: '#2d2d6a', marginBottom: 16 },
  label: { fontWeight: 'bold', color: '#2d2d6a', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 8, marginTop: 4, backgroundColor: '#f8fafc' },
  statusBtn: { borderWidth: 1, borderColor: '#2d2d6a', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 4, marginBottom: 8 },
  textArea: { borderWidth: 1, borderColor: '#2d2d6a', borderRadius: 8, padding: 8, minHeight: 80, marginTop: 4, backgroundColor: '#f8fafc' },
  createBtn: { backgroundColor: '#2d2d6a', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  statusPicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 4,
    marginBottom: 8,
  },
  statusOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedStatus: {
    backgroundColor: '#2d2d6a',
  },
  statusOptionText: {
    color: '#2d2d6a',
  },
  selectedStatusText: {
    color: '#fff',
  },
}); 