import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { setGlobalNavigationRef } from './services/geminiService';

// Import our screens
import ApiKeyScreen from './screens/ApiKeyScreen';
import CameraScreen from './screens/CameraScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import TreatmentScreen from './screens/TreatmentScreen';
import RecommendedTreatmentsScreen from './screens/RecommendedTreatmentsScreen';
import SimulationScreen from './screens/SimulationScreen';
import ReportScreen from './screens/ReportScreen';
import HomeScreen from './screens/HomeScreen';
import LogoGenerator from './utils/LogoGenerator';
import OAuthSetupScreen from './screens/OAuthSetupScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

// Define the type for our stack navigator params
export type RootStackParamList = {
  Home: undefined;
  ApiKey: { forceShow?: boolean } | undefined;
  Camera: undefined;
  Analysis: { imageUri: string; base64Image: string };
  Treatment: {
    analysisResult: any;
    imageUri: string;
    base64Image: string;
    visitPurpose?: string;
  };
  RecommendedTreatments: {
    imageUri: string;
    base64Image: string;
    recommendedTreatments: string[];
    reasons: { [key: string]: string[] };
  };
  Simulation: { selectedTreatments: string[]; imageUri: string; base64Image: string };
  Report: { treatmentIds: string[]; beforeImage: string; afterImage: string };
  LogoGenerator: undefined;
  OAuthSetup: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error("App crashed with error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    console.log("App.tsx: Initializing...");

    // Set up global navigation reference
    setGlobalNavigationRef(navigationRef);

    // Simulate checking initialization
    setTimeout(() => {
      console.log("App.tsx: Initialization complete");
      setIsInitialized(true);
    }, 1000);

    return () => {
      console.log("App.tsx: Cleanup");
    };
  }, []);

  // Add debug logging for navigation
  const onNavigationStateChange = (state: any) => {
    console.log('Navigation state changed:', state);
  };

  console.log("App.tsx: Rendering, isInitialized =", isInitialized);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} onStateChange={onNavigationStateChange}>
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
              options={{ title: 'Treatment Selection' }}
            />
            <Stack.Screen
              name="RecommendedTreatments"
              component={RecommendedTreatmentsScreen}
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
            <Stack.Screen
              name="OAuthSetup"
              component={OAuthSetupScreen}
              options={{ title: 'OAuth Setup' }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{
                title: 'Privacy Policy',
                headerShown: false
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#dc3545'
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#343a40'
  }
});
