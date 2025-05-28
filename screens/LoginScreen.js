import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate input
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: email.trim(),
        password: password.trim()
      });
      console.log('Status Code:', response.status);
      if (response.status === 200) {
        // Lưu token và user info vào AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('expiry', response.data.expiry.toString());
        await AsyncStorage.setItem('user', JSON.stringify({
          id: response.data.user.id,
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          email: response.data.user.email,
          role: response.data.user.role,
          avatar: response.data.user.avatar,
          lastLogin: response.data.user.last_login,
          created: response.data.user.created,
          modified: response.data.user.modified
        }));
        // Chuyển về HomeScreen
        navigation.replace('MainApp');
      }
    } catch (error) {
      
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Log in</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Quên mật khẩu?', 'Chức năng này chưa hỗ trợ')}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.loginText}>{loading ? 'Đang đăng nhập...' : 'Log in'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>
      {/* Social login icons */}
      <View style={styles.socialContainer}>
        <Text style={styles.connectText}>Connect using</Text>
        <View style={styles.socialIcons}>
          {/* Thêm icon mạng xã hội nếu muốn */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 100, height: 100, marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2d2d6a' },
  inputContainer: { width: '80%', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#2d2d6a', borderRadius: 8, padding: 10, fontSize: 16 },
  forgot: { alignSelf: 'flex-end', marginRight: '10%', color: '#2d2d6a', marginBottom: 20, fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#2d2d6a', borderRadius: 8, width: '80%', padding: 15, alignItems: 'center', marginBottom: 10 },
  loginText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  signupBtn: { borderColor: '#2d2d6a', borderWidth: 1, borderRadius: 8, width: '80%', padding: 15, alignItems: 'center', marginBottom: 20 },
  signupText: { color: '#2d2d6a', fontWeight: 'bold', fontSize: 16 },
  socialContainer: { alignItems: 'center', marginTop: 30 },
  connectText: { color: '#2d2d6a', marginBottom: 10 },
  socialIcons: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
});