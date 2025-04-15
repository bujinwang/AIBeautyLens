import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import our screens
import ApiKeyScreen from './screens/ApiKeyScreen';
import CameraScreen from './screens/CameraScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import TreatmentScreen from './screens/TreatmentScreen';
import SimulationScreen from './screens/SimulationScreen';
import ReportScreen from './screens/ReportScreen';
import HomeScreen from './screens/HomeScreen';
import LogoGenerator from './utils/LogoGenerator';

// Define the type for our stack navigator params
export type RootStackParamList = {
  Home: undefined;
  ApiKey: { forceShow?: boolean } | undefined;
  Camera: undefined;
  Analysis: { imageUri: string; base64Image: string };
  Treatment: { analysisResult: any; imageUri: string; base64Image: string };
  Simulation: { selectedTreatments: string[]; imageUri: string; base64Image: string };
  Report: { treatmentIds: string[]; beforeImage: string; afterImage: string };
  LogoGenerator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ApiKey" 
            component={ApiKeyScreen} 
            options={{ title: 'API Key Setup', headerShown: false }} 
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen} 
            options={{ title: 'Take Photo', headerShown: false }} 
          />
          <Stack.Screen 
            name="Analysis" 
            component={AnalysisScreen} 
            options={{ title: 'Analysis' }} 
          />
          <Stack.Screen 
            name="Treatment" 
            component={TreatmentScreen} 
            options={{ title: 'Recommended Treatments' }} 
          />
          <Stack.Screen 
            name="Simulation" 
            component={SimulationScreen} 
            options={{ title: 'Treatment Simulation' }} 
          />
          <Stack.Screen 
            name="Report" 
            component={ReportScreen} 
            options={{ title: 'Treatment Report' }} 
          />
          <Stack.Screen 
            name="LogoGenerator" 
            component={LogoGenerator} 
            options={{ title: 'Logo Generator' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
} 