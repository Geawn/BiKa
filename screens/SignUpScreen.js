import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      {/* Title */}
      <Text style={styles.title}>Sign up</Text>
      {/* First Name */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#2d2d6a"
        />
        <AntDesign name="user" size={20} color="#2d2d6a" style={styles.icon} />
      </View>
      {/* Last Name */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#2d2d6a"
        />
        <AntDesign name="user" size={20} color="#2d2d6a" style={styles.icon} />
      </View>
      {/* Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-mail*"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#2d2d6a"
        />
        <AntDesign name="mail" size={20} color="#2d2d6a" style={styles.icon} />
      </View>
      {/* Password */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#2d2d6a"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="#2d2d6a"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {/* Hint */}
      <Text style={styles.hint}>Swipe to the side to fill in all the fields</Text>
      {/* Continue Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      {/* Login Link */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
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
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d2d6a',
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#2d2d6a',
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    width: '100%',
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2d2d6a',
  },
  icon: {
    marginLeft: 8,
  },
  hint: {
    color: '#2d2d6a',
    fontSize: 12,
    marginBottom: 18,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#2d2d6a',
    borderWidth: 2,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 18,
    marginTop: 2,
  },
  buttonText: {
    color: '#2d2d6a',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
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