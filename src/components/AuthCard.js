import React from 'react'; 
import { Animated, Text, StyleSheet } from 'react-native';

const AuthCard = ({ style, pointerEvents, title, subtitle, children }) => (
  <Animated.View style={[s.card, style]} pointerEvents={pointerEvents}>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{subtitle}</Text>
    {children}
  </Animated.View>
);

const s = StyleSheet.create({
  card: { position: 'absolute', left: 20, right: 20, padding: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  title: { fontSize: 32, color: '#fff', textAlign: 'center', marginBottom: 10, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 18 },
});

export default AuthCard;