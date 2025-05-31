import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import store from './store';
import CreateAssignmentScreen from './screens/CreateAssignmentScreen';
import OnboardingScreen from './screens/OnboardingScreen';
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
import LoginScreen from './screens/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './screens/SplashScreen';
import SignUpScreen from './screens/SignUpScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 65,
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 8,
            paddingBottom: 15,
            shadowColor: '#4f46e5',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
            marginBottom: 4,
            marginTop: 4,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Folder"
          component={FolderScreen}
          options={{
            tabBarLabel: 'Assignments',
            tabBarIcon: ({ color, size }) => <AntDesign name="folderopen" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Task"
          component={TaskScreen}
          options={{
            tabBarLabel: 'Tasks',
            tabBarIcon: ({ color, size }) => <AntDesign name="checkcircleo" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Utility"
          component={UtilityScreen}
          options={{
            tabBarLabel: 'Utility',
            tabBarIcon: ({ color, size }) => <AntDesign name="appstore-o" size={size} color={color} />,
          }}
        />
        {/* Nếu muốn bật lại Settings, nhớ sửa name không trùng */}
        {/* <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Cài đặt',
            tabBarIcon: ({ color, size }) => <AntDesign name="setting" size={size} color={color} />,
          }}
        /> */}
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            tabBarLabel: 'Notification',
            tabBarIcon: ({ color, size }) => <AntDesign name="bells" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}


export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    // Clear AsyncStorage in development mode
    //if (__DEV__) {
    //   AsyncStorage.clear();
    //}

    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch === null) {
    return null; // This is the "tricky" part
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isFirstLaunch ? "Onboarding" : "Splash"} // bật dòng này, tắt dòng dưới để bật login log out
            //   initialRouteName="MainApp"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#99D2E6',
                height: 48,
                shadowColor: '#4f46e5',
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              },
              headerTitleAlign: 'center',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
                color: '#2d2d6a',
              },
              headerTintColor: '#4f46e5',
              headerBackTitleVisible: false,
              headerBackImage: () => (
                <AntDesign name="arrowleft" size={24} color="#4f46e5" style={{ marginLeft: 12 }} />
              ),
            }}
          >
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                title: 'Chỉnh sửa thông tin',
                headerStyle: {
                  backgroundColor: '#99D2E6',
                  height: 32,
                },
                headerTintColor: '#2d2d6a',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerLeft: () => null
              }}
            />
            <Stack.Screen
              name="MainApp"
              component={TabNavigator}
              options={{ headerShown: false }}
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
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}