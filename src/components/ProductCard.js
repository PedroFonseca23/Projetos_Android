import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 20;
const fixedImageHeight = cardWidth * 1.3; 

const ProductCard = ({ product, onPress, onDelete, onEdit, index }) => {
  // Valores iniciais para animação
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current; // Começa 50px para baixo
  const scaleAnim = useRef(new Animated.Value(0.9)).current;     // Começa um pouco menor

  const { theme } = useTheme();

  useEffect(() => {
    // Executa as animações em paralelo para criar o efeito fluido
    Animated.parallel([
      // 1. Aparece suavemente (Fade In)
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Efeito cascata
        useNativeDriver: true,
      }),
      // 2. Desliza para cima com física de mola (Slide Up Spring)
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,   // Controla o "atrito" (quanto menor, mais solto)
        tension: 50,   // Controla a velocidade
        delay: index * 100,
        useNativeDriver: true,
      }),
      // 3. Escala para o tamanho original (Scale Up)
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, [index]);

  return (
    <Animated.View style={[
      s.card, 
      { 
        width: cardWidth, 
        backgroundColor: theme.card, 
        borderColor: theme.border,
        opacity: opacityAnim,
        transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim }
        ]
      }
    ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={s.imageContainer}>
            <Image 
                source={{ uri: product.imageUri }} 
                style={s.image} 
                resizeMode="cover" 
            />
        </View>
        
        <View style={s.info}>
          <Text style={[s.title, { color: theme.text }]} numberOfLines={1}>{product.title}</Text>
          <Text style={[s.price, { color: theme.primary }]}>{product.price}</Text>
        </View>
      </TouchableOpacity>
      
      {(onEdit || onDelete) && (
        <View style={s.adminButtons}>
          {onEdit && (
            <TouchableOpacity style={s.iconButton} onPress={onEdit}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[s.iconButton, { backgroundColor: theme.danger }]} onPress={onDelete}>
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: 16, // Arredondamento um pouco maior para ficar mais moderno
    marginBottom: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    overflow: 'hidden',
    // Sombras mais suaves
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: fixedImageHeight,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: 14,
    paddingVertical: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
  },
  adminButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo um pouco mais transparente
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  }
});

export default ProductCard;