import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config/api';

const UserScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token missing');
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Profile Error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'expiry', 'user']);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AntDesign name="arrowleft" size={28} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: userData?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {userData ? `${userData.first_name} ${userData.last_name}`.trim() : 'Không có tên'}
        </Text>
        <Text style={styles.email}>{userData?.email || ''}</Text>
        <Text style={styles.role}>{userData?.role || ''}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <AntDesign name="user" size={24} color="#4f46e5" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SettingsScreen')}
          activeOpacity={0.7}
        >
          <AntDesign name="setting" size={24} color="#4f46e5" />
          <Text style={styles.menuText}>Account Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <AntDesign name="logout" size={24} color="#ef4444" />
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f3f4ff',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4ff',
  },
  loadingText: {
    color: '#4f46e5',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4f46e5',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#dbeafe',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: '#c7d2fe',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d2fe',
  },
  menuText: {
    marginLeft: 16,
    fontSize: 18,
    color: '#4f46e5',
    fontWeight: '600',
  },
});

export default UserScreen;
