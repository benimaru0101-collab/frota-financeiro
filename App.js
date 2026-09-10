import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </DataProvider>
    </AuthProvider>
  );
}
