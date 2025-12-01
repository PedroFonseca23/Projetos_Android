import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { StyledInput } from '../components/Inputs';
import { CurrencyInput } from '../components/CurrencyInput'; // <--- Importado aqui
import SolidButton from '../components/SolidButton';
import { addProduct } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const AddProductScreen = ({ navigation, route }) => {
  const { userId } = route.params || {}; 
  const { theme } = useTheme();
  
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
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userId) return Alert.alert('Erro', 'Faça login novamente.');
    
    if (!title || !price || !imageUri || !widthDim || !heightDim) {
      return Alert.alert('Atenção', 'Preencha todos os campos e a foto.');
    }

    setIsLoading(true);
    try {
      // O CurrencyInput já formata com "R$", mas garantimos aqui
      let formattedPrice = price.includes('R$') ? price : `R$ ${price}`;
      
      await addProduct(title, formattedPrice, widthDim, heightDim, imageUri, userId);
      Alert.alert('Sucesso', 'Quadro adicionado ao catálogo!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll}>
        
        <Text style={[s.headerTitle, { color: theme.text }]}>Novo Quadro</Text>
        <Text style={[s.headerSub, { color: theme.textSecondary }]}>Preencha os dados da obra para venda</Text>

        <TouchableOpacity 
            style={[s.imagePicker, { backgroundColor: theme.card, borderColor: theme.border }]} 
            onPress={pickImage}
            activeOpacity={0.8}
        >
          {imageUri ? (
            <>
                <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
                <View style={s.editBadge}>
                    <Ionicons name="camera" size={20} color="#fff" />
                </View>
            </>
          ) : (
            <View style={s.placeholder}>
              <Ionicons name="image-outline" size={48} color={theme.textSecondary} />
              <Text style={[s.placeholderText, { color: theme.textSecondary }]}>Carregar Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={s.formSection}>
            <Text style={[s.label, { color: theme.text }]}>Informações Básicas</Text>
            
            <StyledInput 
                placeholder="Título da Obra (ex: Abstrato Azul)" 
                value={title} 
                onChange={setTitle} 
            />
            
            {/* AQUI ESTÁ A MUDANÇA: CurrencyInput */}
            <CurrencyInput 
                placeholder="Valor (R$ 0,00)" 
                value={price} 
                onChange={setPrice} 
            />

            <Text style={[s.label, { color: theme.text, marginTop: 10 }]}>Dimensões</Text>
            <View style={s.row}>
                <View style={{flex: 1, marginRight: 10}}>
                    <StyledInput 
                        placeholder="Largura (cm)" 
                        value={widthDim} 
                        onChange={setWidthDim} 
                        keyboardType="numeric" 
                    />
                </View>
                <View style={{flex: 1}}>
                    <StyledInput 
                        placeholder="Altura (cm)" 
                        value={heightDim} 
                        onChange={setHeightDim} 
                        keyboardType="numeric" 
                    />
                </View>
            </View>
        </View>

        <View style={s.spacer} />
        <SolidButton text={isLoading ? "SALVANDO..." : "PUBLICAR QUADRO"} onPress={handleSave} />
        
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  headerSub: { fontSize: 14, marginBottom: 25 },
  
  imagePicker: { 
      height: 280, 
      borderRadius: 16, 
      marginBottom: 25, 
      overflow: 'hidden', 
      borderWidth: 2, 
      borderStyle: 'dashed', 
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  imagePreview: { width: '100%', height: '100%' },
  editBadge: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 25 },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 10, fontWeight: '600' },

  formSection: { marginBottom: 20 },
  label: { marginBottom: 10, marginLeft: 4, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 },
  row: { flexDirection: 'row' },
  spacer: { height: 20 },
});

export default AddProductScreen;