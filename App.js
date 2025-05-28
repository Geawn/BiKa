import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import store from './store';
import CreateAssignmentScreen from './screens/CreateAssignmentScreen';
// ...

import HomeScreen from './screens/HomeScreen';
import FolderScreen from './screens/FolderScreen';
import TaskScreen from './screens/TaskScreen';
import UtilityScreen from './screens/UtilityScreen';
import NotificationScreen from './screens/NotificationScreen';
import UserScreen from './screens/UserScreen';
import SettingsScreen from './screens/SettingsScreen';
import AssignmentDetailScreen from './screens/AssignmentDetailScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          position: 'absolute',
          bottom: 40,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 15,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Folder"
        component={FolderScreen}
        options={{
          tabBarLabel: 'Assignment',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="folderopen" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Utility"
        component={TaskScreen}
        options={{
          tabBarLabel: 'Task',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="laptop" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={UtilityScreen}
        options={{
          tabBarLabel: 'Tiện ích',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="appstore-o" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="bells" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            headerStyle: {
              backgroundColor: '#99D2E6',
              height: 32,
            },
            headerTintColor: '#2d2d6a',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShown: true,
          }}
        >
          <Stack.Screen 
            name="MainApp" 
            component={TabNavigator} 
            options={{ 
              headerShown: true,
            }} 
          />
          <Stack.Screen 
            name="UserScreen" 
            component={UserScreen}
            options={{
              title: 'User Profile',
              headerLeft: () => null
            }}
          />
          <Stack.Screen 
            name="SettingsScreen" 
            component={SettingsScreen}
            options={{
              title: 'Settings',
              headerLeft: () => null
            }}
          />
          <Stack.Screen 
            name="AssignmentDetailScreen" 
            component={AssignmentDetailScreen}
            options={{
              title: 'Chi tiết bài tập',
              headerLeft: () => null
            }}
          />
          <Stack.Screen 
            name="CreateAssignment" 
            component={CreateAssignmentScreen}
            options={{
              headerLeft: () => null
            }}
          />
          <Stack.Screen 
            name="CreateTaskScreen" 
            component={CreateTaskScreen}
            options={{
              title: 'Tạo Task',
              headerLeft: () => null
            }}
          />
          <Stack.Screen name="Tasks" component={TaskScreen} />
          <Stack.Screen 
            name="TaskDetail" 
            component={TaskDetailScreen} 
            options={{
              title: 'Chi tiết Task',
              headerLeft: () => null,
              headerShown: true
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}