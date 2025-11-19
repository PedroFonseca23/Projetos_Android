import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { StyledInput } from '../components/Inputs';
import SolidButton from '../components/SolidButton';
import { addProduct } from '../database/database';

const AddProductScreen = ({ navigation, route }) => {
  const { userId } = route.params || {}; 
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [widthDim, setWidthDim] = useState('');
  const [heightDim, setHeightDim] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    console.log("--- INÍCIO DO PROCESSO DE SALVAR ---");
    
    
    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado. Tente fazer login novamente.');
      console.error("ERRO: userId está undefined.");
      return;
    }

    if (!title || !price || !imageUri) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios e a imagem.');
      console.log("ERRO: Campos vazios.");
      return;
    }

    setIsLoading(true);
    try {
      
      let formattedPrice = price;
      if (!price.includes('R$')) {
        formattedPrice = `R$ ${price}`;
      }

      console.log(`Tentando salvar: ${title} | Usuário: ${userId}`);
      
      
      await addProduct(title, formattedPrice, widthDim, heightDim, imageUri, userId);
      
      console.log("✅ SUCESSO: Produto salvo no SQLite.");
      Alert.alert('Sucesso', 'Quadro adicionado ao catálogo!');
      navigation.goBack();

    } catch (error) {
      
      console.error("❌ ERRO CRÍTICO AO SALVAR NO BANCO:", error);
      
     
      Alert.alert('Erro ao Salvar', `Detalhes: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.label}>Imagem da Obra</Text>
        <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.imagePreview} />
          ) : (
            <View style={s.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#555" />
              <Text style={s.placeholderText}>Toque para selecionar</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={s.label}>Título da Obra</Text>
        <StyledInput placeholder="Ex: Noite Estrelada" value={title} onChange={setTitle} />

        <Text style={s.label}>Preço (R$)</Text>
        <StyledInput placeholder="Ex: 150,00" value={price} onChange={setPrice} keyboardType="numeric" />

        <View style={s.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={s.label}>Largura (cm)</Text>
            <StyledInput placeholder="Ex: 60" value={widthDim} onChange={setWidthDim} keyboardType="numeric" />
          </View>
          <View style={{flex: 1}}>
            <Text style={s.label}>Altura (cm)</Text>
            <StyledInput placeholder="Ex: 90" value={heightDim} onChange={setHeightDim} keyboardType="numeric" />
          </View>
        </View>

        <View style={s.spacer} />
        <SolidButton text={isLoading ? "Salvando..." : "CADASTRAR QUADRO"} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 20 },
  label: { color: '#ccc', marginBottom: 8, marginLeft: 4, fontSize: 14, fontWeight: '600' },
  imagePicker: { height: 250, backgroundColor: '#1f1f1f', borderRadius: 12, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  imagePreview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { color: '#555', marginTop: 10 },
  row: { flexDirection: 'row' },
  spacer: { height: 20 },
});

export default AddProductScreen;