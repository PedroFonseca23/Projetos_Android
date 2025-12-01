import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const formatCurrency = (value) => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Divide por 100 para considerar os centavos
  const number = parseInt(digits, 10) / 100;
  
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const CurrencyInput = ({ placeholder, value, onChange, keyboard, autoCap }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme(); // Usa o tema global

  const handleChange = (text) => {
    const formatted = formatCurrency(text);
    onChange(formatted);
  };

  return (
    <View style={[
      s.inputContainer,
      { 
        backgroundColor: theme.card, 
        borderColor: isFocused ? theme.primary : theme.border 
      }
    ]}>
      <TextInput
        style={[s.inputCore, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={handleChange}
        keyboardType={keyboard || 'numeric'}
        autoCapitalize={autoCap || 'sentences'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={16} // Limite para evitar números gigantes
      />
    </View>
  );
};

const s = StyleSheet.create({
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 50, 
    borderRadius: 6, 
    marginBottom: 15, 
    borderWidth: 1, 
    paddingHorizontal: 12 
  },
  inputCore: { 
    flex: 1, 
    height: '100%', 
    fontSize: 16 
  },
});