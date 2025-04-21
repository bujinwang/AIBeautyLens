import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView, ImageBackground } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // Add debug logging for component lifecycle
  useEffect(() => {
    console.log("HomeScreen: Component mounted");

    return () => {
      console.log("HomeScreen: Component unmounted");
    };
  }, []);

  const navigateToCamera = () => {
    console.log("HomeScreen: Navigating to Camera");
    navigation.navigate('Camera');
  };

  const navigateToLogoGenerator = () => {
    console.log("HomeScreen: Navigating to Logo Generator");
    navigation.navigate('LogoGenerator');
  };

  const navigateToPrivacyPolicy = () => {
    console.log("HomeScreen: Navigating to Privacy Policy");
    navigation.navigate('PrivacyPolicy');
  };

  console.log("HomeScreen: Rendering");

  try {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary.dark, COLORS.primary.main, 'rgba(255,255,255,0.9)']}
          locations={[0, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Logo size="large" showTagline={true} color="white" />
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.heroContainer}>
            <ImageBackground
              source={require('../assets/images/beauty_hero.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            >
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>
                  AI-Powered Skin Analysis
                </Text>
                <Text style={styles.heroSubtitle}>
                  Get personalized skincare recommendations based on advanced AI analysis
                </Text>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={navigateToCamera}
            >
              <MaterialIcons name="camera-alt" size={24} color="white" />
              <Text style={styles.actionButtonText}>Start DermaGraph™ Analysis</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Elite Analysis Features</Text>

            <View style={styles.featureCard}>
              <MaterialIcons name="face" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>DermaGraph™ Analysis</Text>
                <Text style={styles.featureDescription}>
                  AI-powered skin scanning for comprehensive assessment
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <MaterialIcons name="healing" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>RejuvenationRx™</Text>
                <Text style={styles.featureDescription}>
                  Personalized treatment recommendations from aesthetic experts
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <MaterialIcons name="auto-fix-high" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>TreatmentVision™</Text>
                <Text style={styles.featureDescription}>
                  Visualize potential results with our advanced simulation technology
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <MaterialIcons name="analytics" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>BeautyBlueprint™</Text>
                <Text style={styles.featureDescription}>
                  Personalized treatment planning system for your beauty journey
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>
              "The expertise of 100 aesthetic doctors in a single scan"
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Privacy-First Design: All processing happens on-device or via secure API calls
            </Text>
            <TouchableOpacity
              onPress={navigateToPrivacyPolicy}
              style={styles.privacyLink}
            >
              <Text style={styles.privacyLinkText}>
                View Privacy Policy →
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } catch (error) {
    console.error("HomeScreen: Render error:", error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 20, // Add padding to ensure footer is visible
  },
  headerGradient: {
    paddingTop: 55,
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    position: 'relative',
    zIndex: 5,
  },
  logoContainer: {
    position: 'relative',
    zIndex: 5,
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionContainer: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  featuresContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary.main,
    marginBottom: 15,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  taglineContainer: {
    backgroundColor: 'white',
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  taglineText: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.primary.main,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 20,
    marginTop: 20,
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  privacyLink: {
    marginTop: 16,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  privacyLinkText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
});

export default HomeScreen;
