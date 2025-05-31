import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Image, Alert, Platform, Modal
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

export default function CreateAssignmentScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const formatDate = (date) =>
    date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setStartTime(formatDate(selectedDate));
      if (endDate < selectedDate) {
        setEndDate(selectedDate);
        setEndTime(formatDate(selectedDate));
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setEndTime(formatDate(selectedDate));
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (!startTime.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian bắt đầu');
      return;
    }
    if (!endTime.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian kết thúc');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (!token || !userStr) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const user = JSON.parse(userStr);
      const requestBody = {
        creator: user.id,
        title: title.trim(),
        description: description.trim(),
        start: startDate.toISOString(),
        deadline: endDate.toISOString(),
      };

      const response = await fetch(API_ENDPOINTS.CREATE_ASSIGNMENT, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Lỗi', errorData.message || 'Tạo assignment thất bại');
        return;
      }

      Alert.alert('Thành công', 'Assignment đã được tạo', [
        { text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'Folder' }) },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi trong quá trình tạo assignment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <AntDesign name="arrowleft" size={28} color="#4f46e5" />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.header}>Create New Assignment</Text>

        <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Start time <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              onPress={() => {
                setShowStartPicker(true);
                setShowEndPicker(false);
              }}
              activeOpacity={0.7}
            >
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={startTime}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showStartPicker && (
              <Modal transparent={true} animationType="fade" visible={showStartPicker}>
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onStartDateChange}
                      minimumDate={new Date()}
                      style={styles.datePicker}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowStartPicker(false)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>

          <View style={[styles.flex1, { marginLeft: 16 }]}>
            <Text style={styles.label}>End time <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              onPress={() => {
                setShowEndPicker(true);
                setShowStartPicker(false);
              }}
              activeOpacity={0.7}
            >
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={endTime}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showEndPicker && (
              <Modal transparent={true} animationType="fade" visible={showEndPicker}>
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onEndDateChange}
                      minimumDate={startDate}
                      style={styles.datePicker}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowEndPicker(false)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="..."
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{description.length} / 500</Text>

        <TouchableOpacity
          style={[styles.createBtn, isLoading && styles.disabledBtn]}
          onPress={handleCreate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>{isLoading ? 'Creating...' : 'Create'}</Text>
        </TouchableOpacity>

        {/* <Image
          source={require('../assets/create.png')}
          style={styles.iconImage}
          resizeMode="contain"
        /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff', padding: 16 },
  backBtn: { marginBottom: 20, padding: 4, alignSelf: 'flex-start' },
  header: { fontSize: 28, fontWeight: '700', color: '#4f46e5', marginBottom: 24 },
  label: { fontWeight: '600', color: '#4f46e5', marginBottom: 8, fontSize: 16 },
  required: { color: '#ef4444' },
  input: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#3730a3',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: {
    alignSelf: 'flex-end',
    color: '#a5b4fc',
    marginBottom: 24,
    fontSize: 14,
    fontWeight: '500',
  },
  row: { flexDirection: 'row', marginBottom: 16 },
  flex1: { flex: 1 },
  createBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  disabledBtn: { opacity: 0.6 },
  createBtnText: { color: 'white', fontWeight: '700', fontSize: 18 },
  iconImage: {
    width: 150,
    height: 120,
    alignSelf: 'center',
    marginTop: 36,
    opacity: 0.85,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  datePicker: {
    width: '100%',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});