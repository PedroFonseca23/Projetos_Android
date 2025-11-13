import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StyledInput } from '../components/Inputs';
import { CurrencyInput } from '../components/CurrencyInput';
import SolidButton from '../components/SolidButton';
import { addProduct } from '../database/database';

const AddProductScreen = ({ navigation, route }) => {
  const { userId } = route.params;
  
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [price, setPrice] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handleSave = async () => {
    if (!title || !price || !width || !height || !imageUri) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma imagem.');
      return;
    }
    
    try {
      await addProduct(title, price, parseFloat(width), parseFloat(height), imageUri, userId);
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar o quadro.');
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scrollContent}>
      <TouchableOpacity style={s.imagePicker} onPress={pickImage} activeOpacity={0.7}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.imagePreview} />
        ) : (
          <View style={s.imagePlaceholder}>
            <Ionicons name="camera-outline" size={50} color="#555" />
            <Text style={s.imagePlaceholderText}>Adicionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={s.form}>
        <StyledInput
          placeholder="Título do Quadro"
          value={title}
          onChange={setTitle}
        />
        <View style={s.dimensionRow}>
          <StyledInput
            placeholder="Largura (cm)"
            value={width}
            onChange={setWidth}
            keyboard="numeric"
            style={{flex: 1, marginRight: 10}}
          />
          <StyledInput
            placeholder="Altura (cm)"
            value={height}
            onChange={setHeight}
            keyboard="numeric"
            style={{flex: 1}}
          />
        </View>
        <CurrencyInput
          placeholder="Valor (ex: R$ 199,90)"
          value={price}
          onChange={setPrice}
        />
        
        <SolidButton text="Salvar Quadro" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#777',
    marginTop: 10,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  form: {
    width: '100%',
  },
  dimensionRow: {
    flexDirection: 'row',
  }
});

export default AddProductScreen;