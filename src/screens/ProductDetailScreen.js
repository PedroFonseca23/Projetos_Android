import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SolidButton from '../components/SolidButton';

const DimensionRow = ({ icon, label, value }) => (
  <View style={s.dimRow}>
    <Ionicons name={icon} size={24} color="#aaa" />
    <Text style={s.dimLabel}>{label}</Text>
    <Text style={s.dimValue}>{value} cm</Text>
  </View>
);

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;

  return (
    <SafeAreaView style={s.container} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <Image source={{ uri: product.imageUri }} style={s.image} />
        
        <View style={s.content}>
          <Text style={s.title}>{product.title}</Text>
          <Text style={s.price}>{product.price}</Text>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Medidas</Text>
          <View style={s.dimContainer}>
            <DimensionRow icon="resize-outline" label="Largura" value={product.width} />
            <DimensionRow icon="resize-outline" label="Altura" value={product.height} />
          </View>
          
          <View style={s.divider} />
          
          <SolidButton 
            text="Adicionar ao Carrinho" 
            onPress={() => Alert.alert('Carrinho', 'O carrinho ainda será implementado.')} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#333',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    color: '#00A79D',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  dimContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 15,
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dimLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  dimValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;