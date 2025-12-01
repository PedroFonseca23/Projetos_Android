import React, { createContext, useState, useContext } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Habilita animações no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const themes = {
  dark: {
    background: '#121212',
    card: '#1f1f1f',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#333333',
    primary: '#00A79D',
    danger: '#ff4444',
    statusBarStyle: 'light',
  },
  light: {
    background: '#f5f5f7', // Cinza bem clarinho (estilo iOS)
    card: '#ffffff',
    text: '#000000',
    textSecondary: '#8e8e93',
    border: '#d1d1d6',
    primary: '#00A79D',
    danger: '#ff3b30',
    statusBarStyle: 'dark',
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    // Configura uma transição suave de 300ms
    LayoutAnimation.configureNext(LayoutAnimation.create(
      300,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    ));
    setIsDark(!isDark);
  };

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);