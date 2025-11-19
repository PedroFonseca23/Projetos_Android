import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SolidButton from '../components/SolidButton';
import { addToCart } from '../database/database'; // <--- Importe a função

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  
  
  const handleAddToCart = async () => {
    
    
    try {
        
        if (route.params.userId) {
            await addToCart(route.params.userId, product.id);
            Alert.alert('Sucesso', 'Item adicionado ao carrinho!');
            navigation.goBack();
        } else {
            Alert.alert('Erro', 'Usuário não identificado.');
        }
    } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Falha ao adicionar.');
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView>
        <Image source={{ uri: product.imageUri }} style={s.image} />
        <View style={s.content}>
          <Text style={s.title}>{product.title}</Text>
          <Text style={s.price}>{product.price}</Text>
          <View style={s.divider} />
          <Text style={s.sectionTitle}>Detalhes</Text>
          <Text style={s.description}>
            Dimensões: {product.width}cm x {product.height}cm{'\n'}
            Acabamento premium com moldura de alta resistência.
          </Text>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <SolidButton text="ADICIONAR AO CARRINHO" onPress={handleAddToCart} />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  image: { width: width, height: width, backgroundColor: '#333' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  price: { fontSize: 22, color: '#00A79D', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  sectionTitle: { fontSize: 18, color: '#ddd', marginBottom: 10, fontWeight: '600' },
  description: { fontSize: 16, color: '#aaa', lineHeight: 24 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#1f1f1f' }
});

export default ProductDetailScreen;