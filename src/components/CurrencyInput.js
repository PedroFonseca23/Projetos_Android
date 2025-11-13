import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const formatCurrency = (value) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  
  const number = parseInt(digits, 10) / 100;
  
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const CurrencyInput = ({ placeholder, value, onChange, keyboard, autoCap }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (text) => {
    const formatted = formatCurrency(text);
    onChange(formatted);
  };

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={handleChange}
        keyboardType={keyboard || 'numeric'}
        autoCapitalize={autoCap || 'sentences'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const s = StyleSheet.create({
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12 },
  inputContainerFocused: { borderColor: '#2575FC', borderWidth: 1.5, backgroundColor: 'rgba(0,0,0,0.8)' },
  inputCore: { flex: 1, height: '100%', color: '#fff', fontSize: 16 },
});