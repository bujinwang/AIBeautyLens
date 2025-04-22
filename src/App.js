import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { LocalizationProvider } from './i18n/localizationContext';

function App() {
  return (
    <LocalizationProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </LocalizationProvider>
  );
}

export default App;