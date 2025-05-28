import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import TopBar from '../components/TopBar';
import { AntDesign } from '@expo/vector-icons';

export default function TaskDetailScreen({ route, navigation }) {
  const { task } = route.params;
  // Dữ liệu mẫu nếu thiếu
  const status = task.status || 'Completed';
  const assignedTo = task.assignedTo || '';
  const description = task.description || task.desc || '';
  const startTime = task.startTime || '14/5/2025';
  const endTime = task.endTime || '24/5/2025';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
      <TopBar
        searchQuery={''}
        setSearchQuery={() => {}}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
        </TouchableOpacity>
        <Text style={styles.title}>{task.title}</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Assigned to:</Text>
          <TextInput style={styles.input} value={assignedTo} editable={false} />
        </View>
        <Text style={styles.label}>Description</Text>
        <View style={styles.descBox}>
          <Text style={styles.descText}>{description}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Start time:</Text>
          <TextInput style={styles.input} value={startTime} editable={false} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>End time:</Text>
          <TextInput style={styles.input} value={endTime} editable={false} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafd',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d6a',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#2d2d6a',
    width: 110,
    fontSize: 15,
  },
  statusBox: {
    backgroundColor: '#2ecc40',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginLeft: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 6,
    backgroundColor: '#f4f4f4',
    color: '#2d2d6a',
    fontSize: 14,
  },
  descBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f4f4f4',
    marginBottom: 16,
  },
  descText: {
    color: '#2d2d6a',
    fontSize: 14,
  },
}); 