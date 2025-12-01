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
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { StyledInput } from '../components/Inputs';
import { CurrencyInput } from '../components/CurrencyInput';
import SolidButton from '../components/SolidButton';
import { updateProduct } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const EditProductScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const { theme } = useTheme();

  const [imageUri, setImageUri] = useState(product.imageUri);
  const [title, setTitle] = useState(product.title);
  const [width, setWidth] = useState(product.width ? String(product.width) : '');
  const [height, setHeight] = useState(product.height ? String(product.height) : '');
  const [price, setPrice] = useState(product.price);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handleSave = async () => {
    if (!title || !price || !width || !height || !imageUri) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos e verifique a imagem.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Garante a formatação R$ caso o usuário tenha apagado
      let formattedPrice = price.includes('R$') ? price : `R$ ${price}`;

      await updateProduct(product.id, title, formattedPrice, parseFloat(width), parseFloat(height), imageUri);
      Alert.alert('Sucesso', 'Quadro atualizado com sucesso!');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível atualizar o quadro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        
        {/* Cabeçalho */}
        <Text style={[s.headerTitle, { color: theme.text }]}>Editar Quadro</Text>
        <Text style={[s.headerSub, { color: theme.textSecondary }]}>Atualize as informações do produto</Text>

        {/* Seletor de Imagem */}
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
              <Text style={[s.placeholderText, { color: theme.textSecondary }]}>Selecionar Imagem</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Formulário */}
        <View style={s.form}>
            <Text style={[s.label, { color: theme.text }]}>Detalhes Básicos</Text>
            
            <StyledInput
                placeholder="Título do Quadro"
                value={title}
                onChange={setTitle}
            />
            
            <CurrencyInput
                placeholder="Valor (R$ 0,00)"
                value={price}
                onChange={setPrice}
            />

            <Text style={[s.label, { color: theme.text, marginTop: 15 }]}>Dimensões</Text>
            <View style={s.dimensionRow}>
                <View style={{flex: 1, marginRight: 10}}>
                    <StyledInput
                        placeholder="Largura (cm)"
                        value={width}
                        onChange={setWidth}
                        keyboardType="numeric"
                    />
                </View>
                <View style={{flex: 1}}>
                    <StyledInput
                        placeholder="Altura (cm)"
                        value={height}
                        onChange={setHeight}
                        keyboardType="numeric"
                    />
                </View>
            </View>
            
            <View style={s.spacer} />
            <SolidButton text={isLoading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"} onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
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
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  editBadge: { 
    position: 'absolute', 
    bottom: 15, 
    right: 15, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 10, 
    borderRadius: 25 
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600'
  },
  form: {
    width: '100%',
  },
  label: { 
    marginBottom: 10, 
    marginLeft: 4, 
    fontSize: 14, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    opacity: 0.7 
  },
  dimensionRow: {
    flexDirection: 'row',
  },
  spacer: { height: 20 },
});

export default EditProductScreen;