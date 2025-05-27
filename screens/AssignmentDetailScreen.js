import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params;
  // Mock tasks, description
  const tasks = [
    { id: '1', title: 'Hoàn thành Lexer - PPL', desc: 'Xây dựng bộ phân tích từ vựng (Lexical analysis)' },
    { id: '2', title: 'Hoàn thành AST Generation - PPL', desc: 'Xây dựng cây cú pháp trừu tượng' },
  ];
  const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <TopBar
        searchQuery={''}
        setSearchQuery={() => {}}
        onAvatarPress={() => navigation.navigate('UserScreen')}
        onMenuPress={() => navigation.navigate('SettingsScreen')}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="#2d2d6a" />
          </TouchableOpacity>
          <Text style={styles.title}>{assignment.title}</Text>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <TouchableOpacity>
            <AntDesign name="pluscircleo" size={20} color="#2d2d6a" />
          </TouchableOpacity>
        </View>
        <View style={styles.taskList}>
          {tasks.map(task => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc}>{task.desc}</Text>
            </View>
          ))}
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <TouchableOpacity>
              <Feather name="edit" size={18} color="#2d2d6a" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.infoInput}
            value={description}
            multiline
            editable={false}
          />
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creator</Text>
            <TouchableOpacity>
              <Feather name="edit" size={18} color="#2d2d6a" />
            </TouchableOpacity>
          </View>
          <TextInput style={styles.infoInput} value={assignment.name} editable={false} />
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start time:</Text>
            <TouchableOpacity>
              <Feather name="edit" size={18} color="#2d2d6a" />
            </TouchableOpacity>
          </View>
          <TextInput style={styles.infoInput} value={assignment.start} editable={false} />
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End time:</Text>
            <TouchableOpacity>
              <Feather name="edit" size={18} color="#2d2d6a" />
            </TouchableOpacity>
          </View>
          <TextInput style={styles.infoInput} value={assignment.deadline} editable={false} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 8,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2d2d6a',
    flex: 1,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#2d2d6a', marginRight: 8 },
  taskList: { backgroundColor: '#f1f5f9', borderRadius: 8, marginBottom: 16 },
  taskItem: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 10 },
  taskTitle: { fontWeight: 'bold', color: '#2d2d6a' },
  taskDesc: { color: '#666', fontSize: 13 },
  infoBox: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', padding: 10, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  infoLabel: { fontWeight: 'bold', color: '#2d2d6a' },
  infoInput: { backgroundColor: '#f8fafc', borderRadius: 6, padding: 8, color: '#222', marginTop: 2 },
}); 