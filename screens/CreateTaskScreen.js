import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform
} from 'react-native';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleCreateTask = async () => {
    if (!title.trim() || !assignee.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Bạn cần đăng nhập lại.');
        setIsSubmitting(false);
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
          title: title.trim(),
          description: description.trim(),
          status,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        Alert.alert('Lỗi', responseData.message || 'Tạo task thất bại.');
      } else {
        Alert.alert('Thành công', 'Tạo task thành công.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <AntDesign name="arrowleft" size={28} color="#4f46e5" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Create New Task</Text>

        <Text style={styles.label}>Title <Text style={{color: 'red'}}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          editable={!isSubmitting}
        />

        <Text style={styles.label}>Assignee ID <Text style={{color: 'red'}}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={assignee}
          onChangeText={setAssignee}
          placeholder="Enter assignee ID"
          keyboardType="numeric"
          editable={!isSubmitting}
        />

        <View style={styles.row}>
          <View style={styles.dateWrapper}>
            <Text style={styles.label}>Start Time <Text style={{color: 'red'}}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(startDate)}
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

          <View style={styles.dateWrapper}>
            <Text style={styles.label}>End Time <Text style={{color: 'red'}}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(endDate)}
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

        <Text style={styles.label}>Status</Text>
        <TouchableOpacity style={styles.statusBtn} onPress={() => setShowStatusPicker(!showStatusPicker)}>
          <Text style={styles.statusBtnText}>
            {STATUS_OPTIONS.find(opt => opt.value === status)?.label || 'Select Status'}
          </Text>
        </TouchableOpacity>
        {showStatusPicker && (
          <View style={styles.statusPicker}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusOption,
                  status === opt.value && styles.statusOptionSelected,
                ]}
                onPress={() => {
                  setStatus(opt.value);
                  setShowStatusPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    status === opt.value && styles.statusOptionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="..."
          multiline
          maxLength={500}
          editable={!isSubmitting}
        />
        <Text style={styles.charCount}>{description.length} / 500</Text>

        <TouchableOpacity
          style={[styles.createBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleCreateTask}
          disabled={isSubmitting}
        >
          <Text style={styles.createBtnText}>{isSubmitting ? 'Creating...' : 'Create'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff', padding: 16 },
  backBtn: { marginBottom: 16 },
  header: { fontSize: 26, fontWeight: '700', color: '#4f46e5', marginBottom: 24 },
  label: { fontWeight: '600', color: '#4f46e5', marginBottom: 6 },
  input: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#3730a3',
    marginBottom: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dateWrapper: { flex: 1, marginHorizontal: 4 },
  statusBtn: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statusBtnText: { color: '#4f46e5', fontWeight: '600', fontSize: 16 },
  statusPicker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    marginBottom: 16,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  statusOptionSelected: {
    backgroundColor: '#4f46e5',
  },
  statusOptionText: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  statusOptionTextSelected: {
    color: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#9ca3af',
    marginBottom: 12,
    fontSize: 14,
  },
  createBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
 