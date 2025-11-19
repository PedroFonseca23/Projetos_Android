import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 25;

const ProductCard = ({ product, onPress, userRole, onDelete, onEdit, index }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const cardStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[s.card, { width: cardWidth }, cardStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: product.imageUri }} style={s.image} />
        <View style={s.info}>
          <Text style={s.title} numberOfLines={1}>{product.title}</Text>
          <Text style={s.price}>{product.price}</Text>
        </View>
      </TouchableOpacity>
      
      {(onEdit || onDelete) && (
        <View style={s.adminButtons}>
          {onEdit && (
            <TouchableOpacity style={s.iconButton} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={20} color="#ffbb33" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={s.iconButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 5,
  },
  image: {
    width: '100%',
    height: cardWidth,
    backgroundColor: '#333',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#eee',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A79D',
  },
  adminButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 15,
    marginLeft: 5,
  }
});

export default ProductCard;