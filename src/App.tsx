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

// Define the type for our stack navigator params
export type RootStackParamList = {
  ApiKey: undefined;
  Camera: undefined;
  Analysis: { imageUri: string; base64Image: string };
  Treatment: { analysisResult: any; imageUri: string };
  Simulation: { selectedTreatments: string[]; imageUri: string; base64Image: string };
  Report: { treatmentIds: string[]; beforeImage: string; afterImage: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ApiKey">
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
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
} 