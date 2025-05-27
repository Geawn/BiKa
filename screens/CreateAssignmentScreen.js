import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function CreateAssignmentScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('Trần Ngọc Báo Duy');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

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
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="DD/MM/YYYY"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End time<Text style={{ color: 'red' }}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="DD/MM/YYYY"
            />
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
        <TouchableOpacity style={styles.createBtn}>
          <Text style={styles.createBtnText}>Create</Text>
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
});