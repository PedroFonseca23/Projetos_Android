import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const AuthCard = ({ title, subtitle, icon, children }) => {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.center}>
      <Animated.View 
        style={[
          s.card, 
          { 
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.9)', 
            borderColor: theme.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={s.header}>
            <View style={[s.iconCircle, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name={icon || "person"} size={32} color={theme.primary} />
            </View>
            <Text style={[s.title, { color: theme.text }]}>{title}</Text>
            <Text style={[s.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        </View>
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  card: { width: width * 0.9, maxWidth: 400, padding: 30, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  header: { alignItems: 'center', marginBottom: 25 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});

export default AuthCard;