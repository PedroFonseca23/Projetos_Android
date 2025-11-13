import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = () => (
  <View style={s.headerContainer}>
    <View style={s.headerLogo}>
      <Ionicons name="information-circle-outline" size={24} color="#2575FC" />
      <Text style={s.headerLogoText}>SOBRE NÓS</Text>
    </View>
  </View>
);

const SobreScreen = () => {
  return (
    <SafeAreaView style={s.container}>
      <CustomHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Sobre o Projeto Quadros</Text>
        <Text style={s.text}>
          Este é um aplicativo dedicado à exibição e comercialização de arte. Nossa missão é conectar artistas talentosos com amantes da arte, oferecendo uma plataforma moderna e intuitiva.
        </Text>
        <Text style={s.text}>
          Fundado em 2025, o Projeto Quadros nasceu da paixão por design e tecnologia, com o objetivo de revolucionar a forma como as pessoas descobrem e compram quadros.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1f1f1f',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginLeft: 8,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 24,
    marginBottom: 10,
  },
});

export default SobreScreen;