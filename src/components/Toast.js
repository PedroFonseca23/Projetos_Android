import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOAST_DURATION = 3000;

const Toast = ({ message, onClose, type = 'alert' }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [displayMessage, setDisplayMessage] = useState(null);

  const toastConfig = {
    alert: {
      color: '#ffbb33',
      icon: 'alert-circle-outline',
    },
    success: {
      color: '#00C851',
      icon: 'checkmark-circle-outline',
    },
  };

  const config = toastConfig[type] || toastConfig.alert;

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      timerAnim.setValue(1);

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(timerAnim, {
        toValue: 0,
        duration: TOAST_DURATION,
        useNativeDriver: false,
      }).start();
      
      const timer = setTimeout(() => {
        handleClose();
      }, TOAST_DURATION);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setDisplayMessage(null);
    });
  };

  if (!displayMessage) {
    return null;
  }

  const toastStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        }),
      },
    ],
  };

  const timerStyle = {
    height: 4,
    width: timerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    backgroundColor: config.color,
    borderRadius: 2,
  };

  return (
    <Animated.View style={[s.container, toastStyle]}>
      <SafeAreaView style={s.toast}>
        <View style={s.content}>
          <Ionicons name={config.icon} size={24} color={config.color} />
          <Text style={s.message}>{displayMessage}</Text>
        </View>
        <View style={s.timerBarContainer}>
          <Animated.View style={timerStyle} />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    marginRight: 10,
  },
  timerBarContainer: {
    height: 4,
    backgroundColor: '#555',
  },
});

export default Toast;