import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOAST_DURATION = 3000; // 3 segundos

const Toast = ({ message, onClose }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [displayMessage, setDisplayMessage] = useState(null);

  useEffect(() => {
    // Se uma nova mensagem chegar (e não for nula)...
    if (message) {
      setDisplayMessage(message); // Define a mensagem a ser exibida
      timerAnim.setValue(1); // Reseta a barra de tempo para 100%

      // Anima a entrada
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Inicia a animação da barra de tempo
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: TOAST_DURATION,
        useNativeDriver: false, // 'width' não é compatível com o driver nativo
      }).start();

      // Define o temporizador para fechar o toast
      const timer = setTimeout(() => {
        // Inicia a animação de saída
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // QUANDO a animação de saída terminar:
          onClose(); // Limpa a mensagem no App.js
          setDisplayMessage(null); // Oculta o componente
        });
      }, TOAST_DURATION);

      // Limpa o temporizador se o componente for desmontado
      return () => clearTimeout(timer);
    }
  }, [message]); // Este efeito SÓ roda quando a prop 'message' mudar

  // Se não houver mensagem para exibir, não renderiza nada
  if (!displayMessage) {
    return null;
  }

  // Estilo para a animação de deslizar (entrada/saída)
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

  // Estilo para a barra de tempo
  const timerStyle = {
    height: 4,
    width: timerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'], // Anima de 0% para 100% (ou vice-versa)
    }),
    backgroundColor: '#ffbb33',
    borderRadius: 2,
  };

  return (
    <Animated.View style={[s.container, toastStyle]}>
      <SafeAreaView style={s.toast}>
        <View style={s.content}>
          <Ionicons name="alert-circle-outline" size={24} color="#ffbb33" />
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