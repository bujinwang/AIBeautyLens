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

// Define the type for our stack navigator params
export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Analysis: {
    imageUri: string;
    base64Image: string;
    visitPurpose?: string;
    appointmentLength?: string;
  };
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
    visitPurpose?: string;
    appointmentLength?: string;
  };
  Report: {
    treatmentIds: string[];
    beforeImage: string;
  };
  BeforeAfterComparisonReport: {
    beforeImage: string;
    afterImage: string;
    analysisResults: any;
  };
  LogoGenerator: undefined;
  PrivacyPolicy: undefined;
  Settings: undefined;
  BeforeAfterAnalysis: undefined;
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
      <LocalizationProvider>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef} onStateChange={onNavigationStateChange}>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen
                name="Home"
                component={WrappedHomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Camera"
                component={WrappedCameraScreen}
                options={{ title: 'Take Photo', headerShown: false }}
              />
              <Stack.Screen
                name="Analysis"
                component={WrappedAnalysisScreen}
                options={{ title: 'Analysis' }}
              />
              <Stack.Screen
                name="Treatment"
                component={WrappedTreatmentScreen}
                options={{ title: 'Treatment Selection' }}
              />
              <Stack.Screen
                name="RecommendedTreatments"
                component={WrappedRecommendedTreatmentsScreen}
                options={{ title: 'Recommended Treatments' }}
              />
              <Stack.Screen
                name="Report"
                component={WrappedReportScreen}
                options={{ title: 'Treatment Report' }}
              />
              <Stack.Screen
                name="LogoGenerator"
                component={WrappedLogoGenerator}
                options={{ title: 'Logo Generator' }}
              />
              <Stack.Screen
                name="PrivacyPolicy"
                component={WrappedPrivacyPolicyScreen}
                options={{
                  title: 'Privacy Policy',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="Settings"
                component={WrappedSettingsScreen}
                options={{ title: 'Settings' }}
              />
              <Stack.Screen
                name="BeforeAfterAnalysis"
                component={WrappedBeforeAfterAnalysisScreen}
                options={{ title: 'Before/After Analysis' }}
              />
              <Stack.Screen
                name="BeforeAfterComparisonReport"
                component={WrappedBeforeAfterComparisonReportScreen}
                options={{ title: 'ProgressScan™ Results' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </LocalizationProvider>
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
