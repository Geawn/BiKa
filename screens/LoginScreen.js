import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
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
      if (response.status === 200) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('expiry', response.data.expiry.toString());
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        navigation.replace('MainApp');
      }
    } catch {
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Quên mật khẩu?', 'Chức năng này chưa hỗ trợ')}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.loginBtn, loading && styles.disabledBtn]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.loginText}>{loading ? 'Đang đăng nhập...' : 'Log in'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>
      <View style={styles.socialContainer}>
        <Text style={styles.connectText}>Connect using</Text>
        <View style={styles.socialIcons}>
          {/* Add social icons here if needed */}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: { width: 120, height: 120, marginBottom: 30},
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 25, color: '#2d2d6a' },
  inputContainer: { width: '100%', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#2d2d6a', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    fontSize: 17, color: '#222',
    backgroundColor: '#f7f9ff',
  },
  forgot: {
    alignSelf: 'flex-end',
    marginRight: 8,
    color: '#2d2d6a',
    marginBottom: 30,
    fontWeight: '600',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: '#2d2d6a',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2d2d6a',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  disabledBtn: { opacity: 0.6 },
  loginText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  signupBtn: {
    borderColor: '#2d2d6a',
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: { color: '#2d2d6a', fontWeight: '700', fontSize: 17 },
  socialContainer: { alignItems: 'center', marginTop: 40 },
  connectText: { color: '#2d2d6a', marginBottom: 14, fontSize: 15, fontWeight: '600' },
  socialIcons: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
});
