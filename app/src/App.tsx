import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { setGlobalNavigationRef } from './services/geminiService';
import { LocalizationProvider } from './i18n/localizationContext';
import ScreenWrapper from './components/ScreenWrapper';
import { withFeedbackButton } from './components/withFeedbackButton';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './contexts/ErrorContext';
import { AuthProvider } from './contexts/AuthContext';

// Import our screens
import CameraScreen from './screens/CameraScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import TreatmentScreen from './screens/TreatmentScreen';
import RecommendedTreatmentsScreen from './screens/RecommendedTreatmentsScreen';
import ReportScreen from './screens/ReportScreen';
import HomeScreen from './screens/HomeScreen';
import LogoGenerator from './utils/LogoGenerator';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import SettingsScreen from './screens/SettingsScreen';
import BeforeAfterAnalysisScreen from './screens/BeforeAfterAnalysisScreen';
import BeforeAfterComparisonReportScreen from './screens/BeforeAfterComparisonReportScreen';
import EyeAnalysisScreen from './screens/EyeAnalysisScreen';
import EyeTreatmentsScreen from './screens/EyeTreatmentsScreen'; // Import the new screen
import HairScalpAnalysisScreen from './screens/HairScalpAnalysisScreen';
import HairTreatmentsScreen from './screens/HairTreatmentsScreen'; // Import the Hair Treatments screen
import { HairScalpAnalysisResult } from './types/hairScalpAnalysis';
import { COLORS } from './constants/theme';

// Define our route parameters
export type RootStackParamList = {
  Home: undefined;
  Camera: {
    mode?: 'facial' | 'eye' | 'beforeAfter' | 'hairScalp';
    visitPurpose?: string; 
  };
  Analysis: {
    base64Image: string;
    imageUri: string;
    visitPurpose?: string;
  };
  EyeAnalysis: {
    base64Image?: string;
    imageUri: string;
    visitPurpose?: string;
    eyeAnalysisResult?: any;
  };
  BeforeAfterAnalysis: {
    beforeImage: string;
    afterImage: string;
  };
  BeforeAfterComparisonReport: {
    beforeImage: string;
    afterImage: string;
    analysisResult?: any;
  };
  Treatment: {
    base64Image?: string;
    imageUri?: string;
    analysisResult?: any;
    visitPurpose?: string;
  };
  RecommendedTreatments: {
    imageUri: string;
    recommendedTreatments: string[];
    reasons: { [key: string]: string[] };
    visitPurpose?: string;
  };
  LogoGenerator: undefined; // Added for LogoGenerator route
  HairScalpAnalysis: {
    imageUris: string[];
    hairScalpAnalysisResult?: HairScalpAnalysisResult;
  };
  EyeTreatments: {
    eyeAnalysisResult: any;
    imageUri?: string;
    visitPurpose?: string;
  };
  HairTreatments: {
    hairScalpAnalysisResult: HairScalpAnalysisResult;
    imageUris?: string[];
  };
  Report: {
    analysisType?: 'eye' | 'fullFace' | 'beforeAfter' | 'hairScalp';
    imageUri?: string;
    eyeAnalysisResult?: any;
    analysisResult?: any;
    beforeAfterAnalysisResult?: any;
    treatmentIds?: string[];
    beforeImage?: string;
    afterImage?: string;
    visitPurpose?: string;
    imageUris?: string[];
    hairScalpAnalysisResult?: HairScalpAnalysisResult;
  };
  PrivacyPolicy: undefined;
  Settings: undefined;
};

// Create the navigation stack
const Stack = createStackNavigator<RootStackParamList>();

// Create wrapped screen components with feedback button
const WrappedHomeScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <HomeScreen {...props} />
  </ScreenWrapper>
));

const WrappedCameraScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <CameraScreen {...props} />
  </ScreenWrapper>
));

const WrappedAnalysisScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <AnalysisScreen {...props} />
  </ScreenWrapper>
));

const WrappedTreatmentScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <TreatmentScreen {...props} />
  </ScreenWrapper>
));

const WrappedRecommendedTreatmentsScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <RecommendedTreatmentsScreen {...props} />
  </ScreenWrapper>
));

const WrappedReportScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <ReportScreen {...props} />
  </ScreenWrapper>
));

const WrappedLogoGenerator = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <LogoGenerator {...props} />
  </ScreenWrapper>
));

const WrappedPrivacyPolicyScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <PrivacyPolicyScreen {...props} />
  </ScreenWrapper>
));

const WrappedSettingsScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <SettingsScreen {...props} />
  </ScreenWrapper>
));

const WrappedEyeAnalysisScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <EyeAnalysisScreen {...props} />
  </ScreenWrapper>
));

const WrappedBeforeAfterAnalysisScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <BeforeAfterAnalysisScreen {...props} />
  </ScreenWrapper>
));

const WrappedBeforeAfterComparisonReportScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <BeforeAfterComparisonReportScreen {...props} />
  </ScreenWrapper>
));

const WrappedEyeTreatmentsScreen = withFeedbackButton((props: any) => ( // Wrap the new screen
  <ScreenWrapper>
    <EyeTreatmentsScreen {...props} />
  </ScreenWrapper>
));

const WrappedHairScalpAnalysisScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <HairScalpAnalysisScreen {...props} />
  </ScreenWrapper>
));

const WrappedHairTreatmentsScreen = withFeedbackButton((props: any) => (
  <ScreenWrapper>
    <HairTreatmentsScreen {...props} />
  </ScreenWrapper>
));

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
    // Intentionally empty to prevent logging while keeping the function reference
  };

  const screenOptions = {
    headerStyle: {
      backgroundColor: COLORS.primary.main,
    },
    headerTintColor: COLORS.primary.contrast,
    headerBackTitle: "",
  };

  if (!isInitialized) {
    // Display loading screen while initializing
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <LocalizationProvider>
              <NavigationContainer ref={navigationRef} onStateChange={onNavigationStateChange}>
                <StatusBar style="light" />
                <Stack.Navigator
                  initialRouteName="Home"
                  screenOptions={screenOptions}
                >
                  <Stack.Screen name="Home" component={WrappedHomeScreen} />
                  <Stack.Screen name="Camera" component={WrappedCameraScreen} />
                  <Stack.Screen name="Analysis" component={WrappedAnalysisScreen} />
                  <Stack.Screen name="Treatment" component={WrappedTreatmentScreen} />
                  <Stack.Screen name="RecommendedTreatments" component={WrappedRecommendedTreatmentsScreen} />
                  <Stack.Screen name="Report" component={WrappedReportScreen} />
                  <Stack.Screen name="LogoGenerator" component={WrappedLogoGenerator} />
                  <Stack.Screen name="PrivacyPolicy" component={WrappedPrivacyPolicyScreen} />
                  <Stack.Screen name="Settings" component={WrappedSettingsScreen} />
                  <Stack.Screen name="EyeAnalysis" component={WrappedEyeAnalysisScreen} />
                  <Stack.Screen name="BeforeAfterAnalysis" component={WrappedBeforeAfterAnalysisScreen} />
                  <Stack.Screen name="BeforeAfterComparisonReport" component={WrappedBeforeAfterComparisonReportScreen} />
                  <Stack.Screen name="EyeTreatments" component={WrappedEyeTreatmentsScreen} />
                  <Stack.Screen name="HairScalpAnalysis" component={WrappedHairScalpAnalysisScreen} />
                  <Stack.Screen name="HairTreatments" component={WrappedHairTreatmentsScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </LocalizationProvider>
          </SafeAreaProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
