import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Animated, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './src/database/database';
import HomeScreen from './src/screens/HomeScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import SelectEditScreen from './src/screens/SelectEditScreen';
import SobreScreen from './src/screens/SobreScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import Toast from './src/components/Toast';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const BG = { uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format-fit=crop' };

const AuthBackground = () => (
  <ImageBackground source={BG} resizeMode="cover" style={StyleSheet.absoluteFill}>
    <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)'}} />
  </ImageBackground>
);

function AuthNavigator({ onLoginSuccess }) {
  const [alertMessage, setAlertMessage] = useState(null);

  const showAlert = (msg) => {
    setAlertMessage(msg);
  };
  
  const closeAlert = () => {
    setAlertMessage(null);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{flex: 1}}
    >
      <AuthBackground />
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="Login">
          {props => (
            <View style={s.authContainer}>
              <LoginScreen {...props} onLoginSuccess={onLoginSuccess} showAlert={showAlert} />
            </View>
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {props => (
            <View style={s.authContainer}>
              <RegisterScreen {...props} showAlert={showAlert} />
            </View>
          )}
        </Stack.Screen>
      </Stack.Navigator>
      
      <Toast message={alertMessage} onClose={closeAlert} />
      
    </KeyboardAvoidingView>
  );
}

function HomeStackNavigator({ userId, userRole, onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1f1f1f' },
        headerTintColor: '#fff',
        headerTitleAlign: 'left',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen 
        name="HomeScreen"
        options={{
          headerShown: false,
        }}
      >
        {props => <HomeScreen {...props} userId={userId} userRole={userRole} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ title: 'Adicionar Novo Quadro' }}
        initialParams={{ userId: userId }}
        />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen} 
        options={{ title: 'Editar Quadro' }}
      />
      <Stack.Screen 
        name="SelectEditScreen" 
        component={SelectEditScreen} 
        options={{ title: 'Editar Quadros' }}
        initialParams={{ userId: userId, userRole: userRole }}
      />
      <Stack.Screen 
        name="ProductDetailScreen" 
        component={ProductDetailScreen} 
        options={{ title: 'Detalhes do Quadro' }}
      />
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
          if (route.name === 'Início') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Sobre') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#1f1f1f',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#2575FC',
        tabBarInactiveTintColor: '#aaa',
      })}
    >
      <Tab.Screen name="Início">
        {props => <HomeStackNavigator {...props} userId={userId} userRole={userRole} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Sobre" component={SobreScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLogin = (user) => {
    setUserToken(user.id);
    setUserRole(user.role);
  };
  
  const handleLogout = () => {
    setUserToken(null);
    setUserRole(null);
  };

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase();
        console.log("Banco de dados SQLite inicializado com sucesso.");
      } catch (e) {
        console.error("Erro ao inicializar banco de dados SQLite", e);
      }
      setIsLoading(false);
    };

    initializeDB();
  }, []);

  if (isLoading) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {userToken == null ? (
          <AuthNavigator onLoginSuccess={handleLogin} />
        ) : (
          <MainTabNavigator userId={userToken} userRole={userRole} onLogout={handleLogout} />
        )}
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212' 
  },
  loadingText: { 
    fontSize: 24, 
    color: '#fff', 
    fontWeight: '700' 
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
});