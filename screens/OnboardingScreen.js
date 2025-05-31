import React, { useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Trouble in managing task?',
    description: "We help you organize tasks effortlessly\nTurn your to-do list into done\nDon't let messy tasks slow you down",
    image: require('../assets/icon.png'), // Thay bằng ảnh phù hợp sau  
    skip: true,
  },
  {
    key: '2',
    title: 'BIKA',
    description: 'Master Your Assignments,\nHCMUT Tech Style!',
    image: require('../assets/onboarding.png'), 
    skip: false,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.slide}>
      {item.skip && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={[styles.desc, index === 0 && { color: '#fff', backgroundColor: '#1A237E' }, index === 1 && { color: '#1A237E', backgroundColor: '#fff' }]}>{item.description}</Text>
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>{index === slides.length - 1 ? 'Try our app!' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={e => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(idx);
      }}
      keyExtractor={item => item.key}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  skipBtn: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 1,
  },
  skipText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: width * 0.7,
    height: 220,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
  },
  desc: {
    borderRadius: 30,
    padding: 20,
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    width: width * 0.9,
  },
  bottom: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#7C4DFF',
  },
  nextBtn: {
    backgroundColor: '#fff',
    borderColor: '#1A237E',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  nextText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 