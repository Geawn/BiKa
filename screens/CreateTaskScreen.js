import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function CreateTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('Ready');
  const [description, setDescription] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
        </TouchableOpacity>
        <Text style={styles.header}>Create new task</Text>
        <Text style={styles.label}>Title<Text style={{color:'red'}}>*</Text></Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title" />
        <Text style={styles.label}>Assignee<Text style={{color:'red'}}>*</Text></Text>
        <TextInput style={styles.input} value={assignee} onChangeText={setAssignee} placeholder="Enter assignee" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start time<Text style={{color:'red'}}>*</Text></Text>
            <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="dd/mm/yyyy" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>End time<Text style={{color:'red'}}>*</Text></Text>
            <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="dd/mm/yyyy" />
          </View>
        </View>
        <Text style={styles.label}>Status<Text style={{color:'red'}}>*</Text></Text>
        <TouchableOpacity style={styles.statusBtn}>
          <Text style={{ color: '#2d2d6a' }}>{status}</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Discription</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="..."
          multiline
          maxLength={500}
        />
        <Text style={{ alignSelf: 'flex-end', color: '#888', marginBottom: 8 }}>{description.length} / 500</Text>
        <TouchableOpacity style={styles.createBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Create</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <AntDesign name="solution1" size={80} color="#2d2d6a" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: 'bold', color: '#2d2d6a', marginBottom: 16 },
  label: { fontWeight: 'bold', color: '#2d2d6a', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 8, marginTop: 4, backgroundColor: '#f8fafc' },
  statusBtn: { borderWidth: 1, borderColor: '#2d2d6a', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 4, marginBottom: 8 },
  textArea: { borderWidth: 1, borderColor: '#2d2d6a', borderRadius: 8, padding: 8, minHeight: 80, marginTop: 4, backgroundColor: '#f8fafc' },
  createBtn: { backgroundColor: '#2d2d6a', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
}); 