import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SolidButton = ({ onPress, text }) => (
  <TouchableOpacity onPress={onPress} style={[s.buttonContainer, s.solidButton]} activeOpacity={0.85}>
    <Text style={s.btnText}>{text}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  btnText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  buttonContainer: { marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  solidButton: { backgroundColor: '#4A37C2', paddingVertical: 15, borderRadius: 5, alignItems: 'center' },
});

export default SolidButton;