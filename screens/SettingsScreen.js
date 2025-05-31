import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
  notifications: 'settings_notifications',
  darkMode: 'settings_darkMode',
  soundEnabled: 'settings_soundEnabled',
};

const TERMS_CONTENT = `Bản quyền thuộc về nhóm sinh viên 1Ngay3Dem thuộc trường Đại học Bách khoa - ĐHQG TPHCM cho môn học Phát triển Ứng dụng trên Thiết bị Di động.
Người dùng đồng ý tuân thủ các quy định sử dụng ứng dụng, không vi phạm pháp luật, bảo vệ thông tin cá nhân và tôn trọng quyền sở hữu trí tuệ.`;

const PRIVACY_CONTENT = `Chính sách bảo mật: Chúng tôi cam kết bảo vệ dữ liệu cá nhân của người dùng, không chia sẻ thông tin cho bên thứ ba nếu không được phép. Mọi dữ liệu được lưu trữ an toàn và chỉ sử dụng cho mục đích cải thiện dịch vụ.`;

const AccordionItem = ({ title, content }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);

    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity style={styles.accordionHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <AntDesign name={expanded ? 'up' : 'down'} size={20} color="#4f46e5" />
      </TouchableOpacity>
      <Animated.View style={[styles.accordionContent, { maxHeight }]}>
        <ScrollView nestedScrollEnabled style={{ flexGrow: 1 }}>
          <Text style={styles.accordionText}>{content}</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [animValue] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem(SETTINGS_KEYS.notifications);
        const savedDarkMode = await AsyncStorage.getItem(SETTINGS_KEYS.darkMode);
        const savedSound = await AsyncStorage.getItem(SETTINGS_KEYS.soundEnabled);

        if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
        if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
        if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      } catch (e) {
        console.warn('Failed to load settings', e);
      }
    })();

    Animated.timing(animValue, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleSetting = async (key, value, setter) => {
    setter(value);
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (e) {
      console.warn(`Failed to save setting ${key}`, e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={26} color="#4f46e5" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: animValue }]}>Settings</Animated.Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#4f46e5' }}
            thumbColor={notifications ? '#6366f1' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={(val) => toggleSetting(SETTINGS_KEYS.notifications, val, setNotifications)}
            value={notifications}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#4f46e5' }}
            thumbColor={darkMode ? '#6366f1' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={(val) => toggleSetting(SETTINGS_KEYS.darkMode, val, setDarkMode)}
            value={darkMode}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Sound</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#4f46e5' }}
            thumbColor={soundEnabled ? '#6366f1' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={(val) => toggleSetting(SETTINGS_KEYS.soundEnabled, val, setSoundEnabled)}
            value={soundEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <AccordionItem title="Terms of Service" content={TERMS_CONTENT} />
        <AccordionItem title="Privacy Policy" content={PRIVACY_CONTENT} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  backButton: {
    marginRight: 20,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4f46e5',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#aabbff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  accordionContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d2fe',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  accordionContent: {
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  accordionText: {
    fontSize: 14,
    color: '#374151',
    paddingVertical: 12,
    lineHeight: 20,
  },
});

export default SettingsScreen;
