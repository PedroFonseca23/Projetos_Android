import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './src/database/database';
import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import SelectEditScreen from './src/screens/SelectEditScreen';
import MoreScreen from './src/screens/MoreScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import Toast from './src/components/Toast';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const BG = { uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format-fit=crop' };

// --- COMPONENTES VISUAIS ---

const AuthBackground = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(scaleAnim, { toValue: 1.15, duration: 15000, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: scaleAnim }] }]}>
      <ImageBackground source={BG} resizeMode="cover" style={StyleSheet.absoluteFill}>
        <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)'}} />
      </ImageBackground>
    </Animated.View>
  );
};

// --- NAVEGADORES ---

function AuthNavigator({ onLoginSuccess, showToast }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <AuthBackground />
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="Login">
          {props => (
            <View style={s.authContainer}>
                <LoginScreen 
                    {...props} 
                    onLoginSuccess={onLoginSuccess} 
                    showAlert={(msg) => showToast(msg, 'alert')} 
                />
            </View>
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {props => (
             <View style={s.authContainer}>
                <RegisterScreen 
                    {...props} 
                    showAlert={(msg) => showToast(msg, 'alert')} 
                    showSuccess={(msg) => showToast(msg, 'success')} 
                />
             </View>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );
}

function CatalogStackNavigator({ userId, userRole }) {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1f1f1f' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="CatalogList" component={CatalogScreen} options={{ headerShown: false }} initialParams={{ userId, userRole }} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} options={{ title: 'Detalhes' }} initialParams={{ userId }} />
      <Stack.Screen name="CartScreen" component={CartScreen} options={{ title: 'Carrinho', headerShown: false }} initialParams={{ userId }} />
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Adicionar Quadro' }} initialParams={{ userId }} />
      <Stack.Screen name="SelectEditScreen" component={SelectEditScreen} options={{ title: 'Gerenciar Quadros' }} initialParams={{ userId, userRole }} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Editar' }} />
    </Stack.Navigator>
  );
}

function MoreStackNavigator({ userId, userRole }) {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1f1f1f' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="MoreList" component={MoreScreen} options={{ headerShown: false }} initialParams={{ userId, userRole }} />
    </Stack.Navigator>
  );
}

function MainTabNavigator({ userId, userRole, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Catálogo') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Mais') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: '#1f1f1f', borderTopColor: '#333', height: 60, paddingBottom: 10 },
        tabBarActiveTintColor: '#00A79D',
        tabBarInactiveTintColor: '#666',
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Catálogo">
        {() => <CatalogStackNavigator userId={userId} userRole={userRole} />}
      </Tab.Screen>
      <Tab.Screen name="Mais">
        {() => <MoreStackNavigator userId={userId} userRole={userRole} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// --- APP PRINCIPAL ---

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false); // Controle do Banco de Dados
  
  // Estados do Toast
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Função auxiliar para mostrar toast
  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    const startApp = async () => {
      console.log("⏳ Iniciando App...");
      const success = await initDatabase();
      if (success) {
        setIsDbReady(true); 
        console.log("🚀 App liberado!");
      } else {
        console.error("❌ Falha crítica na inicialização do DB");
      }
    };
    startApp();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#00A79D" />
        <Text style={{color: '#fff', marginTop: 20}}>Preparando Banco de Dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        
        {!userToken ? (
            <AuthNavigator 
                onLoginSuccess={(user) => { setUserToken(user.id); setUserRole(user.role); }} 
                showToast={showToast}
            />
        ) : (
            <MainTabNavigator userId={userToken} userRole={userRole} onLogout={() => setUserToken(null)} />
        )}

        {}
        <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
        
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
});
