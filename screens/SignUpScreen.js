import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (response.status === 200 || response.status === 201) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('expiry', response.data.expiry.toString());
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            id: response.data.user.id,
            firstName: response.data.user.first_name,
            lastName: response.data.user.last_name,
            email: response.data.user.email,
            role: response.data.user.role,
            avatar: response.data.user.avatar,
            lastLogin: response.data.user.last_login,
            created: response.data.user.created,
            modified: response.data.user.modified,
          })
        );
        navigation.replace('MainApp');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Đăng ký thất bại', 'Email đã tồn tại hoặc có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Sign up</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#999"
        />
        <AntDesign name="user" size={20} color="#2d2d6a" style={styles.icon} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#999"
        />
        <AntDesign name="user" size={20} color="#2d2d6a" style={styles.icon} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-mail*"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <AntDesign name="mail" size={20} color="#2d2d6a" style={styles.icon} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#2d2d6a"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledBtn]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Đang đăng ký...' : 'Continue'}</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          Log in
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#2d2d6a',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d6a',
    borderRadius: 12,
    backgroundColor: '#f7f9ff',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#222',
    paddingVertical: 14,
  },
  icon: {
    marginLeft: 8,
  },
  button: {
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
  disabledBtn: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  loginText: {
    color: '#2d2d6a',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 8,
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
