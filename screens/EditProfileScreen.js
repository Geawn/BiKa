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
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token missing');
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    }
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ và tên');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Bạn cần đăng nhập lại');

      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông tin');
      }

      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AntDesign name="arrowleft" size={28} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Họ</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Nhập họ của bạn"
          editable={!loading}
        />

        <Text style={styles.label}>Tên</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Nhập tên của bạn"
          editable={!loading}
        />

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
    backgroundColor: '#f3f4ff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: '#c7d2fe',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  backBtn: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#4f46e5' },
  form: { padding: 16 },
  label: {
    fontSize: 16,
    color: '#4f46e5',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#3730a3',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  updateButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  updateButtonDisabled: { opacity: 0.7 },
  updateButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});

export default EditProfileScreen;
