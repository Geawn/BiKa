import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateAssignmentScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCreator(`${user.last_name} ${user.first_name}`);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

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
      setStartTime(formatDate(selectedDate));
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
    console.log('Starting assignment creation process...');
    // Validate required fields
    if (!title.trim()) {
      console.log('Validation failed: Empty title');
      Alert.alert('Error', 'Please enter title');
      return;
    }
    if (!startTime.trim()) {
      console.log('Validation failed: Empty start time');
      Alert.alert('Error', 'Please enter start time');
      return;
    }
    if (!endTime.trim()) {
      console.log('Validation failed: Empty end time');
      Alert.alert('Error', 'Please enter end time');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (!token || !userStr) {
        console.log('Error: No token or user info found');
        Alert.alert('Error', 'Please login again');
        return;
      }

      const user = JSON.parse(userStr);
      console.log('User info loaded:', { userId: user.id, userName: creator });

      const requestBody = {
        creator: user.id,
        title: title.trim(),
        description: description.trim(),
        start: startDate.toISOString(),
        deadline: endDate.toISOString(),
      };
      console.log('Request body:', requestBody);

      console.log('Sending POST request to:', API_ENDPOINTS.CREATE_ASSIGNMENT);
      const response = await fetch(API_ENDPOINTS.CREATE_ASSIGNMENT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRFTOKEN': 'Z1tnUQ2PXG3TcLaebVOzsCwNF1jdqfAKShjHVKGQwvL5OHK9u2NEeFW4wTxOtGAI',
          'accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error('Failed to create assignment');
      }

      console.log('Assignment created successfully');
      Alert.alert('Success', 'Assignment created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('FolderScreen'),
        },
      ]);
    } catch (error) {
      console.error('Error in handleCreate:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
      console.log('Assignment creation process completed');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
        <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Create new assignment</Text>
        <Text style={styles.label}>Title<Text style={{ color: 'red' }}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />
        <Text style={styles.label}>Creator<Text style={{ color: 'red' }}>*</Text></Text>
        <TextInput
          style={[styles.input, { color: '#bdbdbd' }]}
          value={creator}
          editable={false}
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start time<Text style={{ color: 'red' }}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
              <TextInput
                style={styles.input}
                value={startTime}
                placeholder="DD/MM/YYYY"
                editable={false}
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
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End time<Text style={{ color: 'red' }}>*</Text></Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
              <TextInput
                style={styles.input}
                value={endTime}
                placeholder="DD/MM/YYYY"
                editable={false}
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
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="..."
          multiline
          maxLength={500}
        />
        <Text style={{ alignSelf: 'flex-end', color: '#bdbdbd', marginBottom: 16 }}>{description.length} / 500</Text>
        <TouchableOpacity 
          style={[styles.createBtn, isLoading && styles.disabledBtn]} 
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.createBtnText}>{isLoading ? 'Creating...' : 'Create'}</Text>
        </TouchableOpacity>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: 150, height: 120, alignSelf: 'center', marginTop: 24 }}
          resizeMode="contain"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: 'bold', color: '#2d2d6a', marginBottom: 16 },
  label: { fontWeight: 'bold', color: '#2d2d6a', marginBottom: 4 },
  input: { borderBottomWidth: 1, borderColor: '#bdbdbd', marginBottom: 16, padding: 8, borderRadius: 4, backgroundColor: '#f8fafc' },
  row: { flexDirection: 'row', marginBottom: 16 },
  createBtn: { backgroundColor: '#2d2d6a', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disabledBtn: { opacity: 0.7 },
});