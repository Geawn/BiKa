import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    console.log('[EditProfile] Screen mounted');
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    console.log('[EditProfile] Fetching user profile...');
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('[EditProfile] Token retrieved:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.error('[EditProfile] Profile fetch failed:', response.status);
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('[EditProfile] Profile data received:', {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: data.role
      });
      
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
    } catch (error) {
      console.error('[EditProfile] Profile Error:', error.message);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    }
  };

  const handleUpdateProfile = async () => {
    console.log('[EditProfile] Update profile initiated', {
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    if (!firstName.trim() || !lastName.trim()) {
      console.log('[EditProfile] Validation failed: Empty fields');
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ và tên');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('[EditProfile] Token retrieved:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('[EditProfile] Sending update request...');
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRFToken': token,
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });

      const responseData = await response.json();
      console.log('[EditProfile] Response data:', responseData);

      if (!response.ok) {
        console.error('[EditProfile] Update failed:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        if (responseData.errors && responseData.errors[0]?.code === 'permission_denied') {
          throw new Error('Không có quyền cập nhật thông tin');
        }
        throw new Error(responseData.message || 'Failed to update profile');
      }

      console.log('[EditProfile] Profile updated successfully');
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        {
          text: 'OK',
          onPress: () => {
            console.log('[EditProfile] Navigating back to UserScreen');
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('[EditProfile] Update Error:', error.message);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập họ của bạn"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nhập tên của bạn"
          />
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Cập nhật</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 