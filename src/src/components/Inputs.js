import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const StyledInput = ({ placeholder, value, onChange, secure, keyboard, autoCap, style }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused, style]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={secure}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard || 'default'}
        autoCapitalize={autoCap || 'sentences'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export const PasswordInput = ({ value, onChange, placeholder, autoCap = 'none' }) => {
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused, s.passwordInputContainer]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={!show}
        value={value}
        onChangeText={onChange}
        autoCapitalize={autoCap}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <TouchableOpacity style={s.eye} onPress={() => setShow(prev => !prev)} activeOpacity={0.8}>
        <Ionicons 
          name={show ? 'eye' : 'eye-off'} 
          size={24} 
          color="#aaa" 
        />
      </TouchableOpacity>
    </View>
  );
};

export const PhoneMaskInput = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, '');
    const truncatedDigits = digits.slice(0, 11);

    let maskedText = '';
    if (truncatedDigits.length > 0) {
      maskedText = `(${truncatedDigits.slice(0, 2)}`;
    }
    if (truncatedDigits.length >= 3) {
      maskedText = `(${truncatedDigits.slice(0, 2)}) ${truncatedDigits.slice(2, 7)}`;
    }
    if (truncatedDigits.length >= 8) {
      maskedText = `(${truncatedDigits.slice(0, 2)}) ${truncatedDigits.slice(2, 7)}-${truncatedDigits.slice(7)}`;
    }
    
    if (truncatedDigits.length === 0) {
      maskedText = '';
    } else if (truncatedDigits.length <= 2) {
        maskedText = `(${truncatedDigits}`;
    }

    onChange(maskedText);
  };

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused]}>
      <TextInput
        style={s.inputCore}
        placeholder="Telefone (com DDD)"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
        value={value}
        onChangeText={handlePhoneChange}
        maxLength={15}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const s = StyleSheet.create({
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12 },
  inputContainerFocused: { 
    borderColor: '#00A79D',
    borderWidth: 1.5, 
    backgroundColor: 'rgba(0,0,0,0.8)' 
  },
  inputCore: { flex: 1, height: '100%', color: '#fff', fontSize: 16 },
  passwordInputContainer: { paddingLeft: 12, paddingRight: 0 }, 
  eye: { paddingHorizontal: 12, height: '100%', justifyContent: 'center', alignItems: 'center' }, 
});