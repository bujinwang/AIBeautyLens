import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView, ImageBackground, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalization } from '../i18n/localizationContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLocalization();
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

  const navigateToSettings = () => {
    console.log("HomeScreen: Navigating to Settings");
    navigation.navigate('Settings');
  };

  const navigateToBeforeAfterAnalysis = () => {
    console.log("HomeScreen: Navigating to Before/After Analysis");
    navigation.navigate('BeforeAfterAnalysis');
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
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={navigateToSettings}
            >
              <Ionicons name="settings-outline" size={28} color="white" />
            </TouchableOpacity>
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
              <Text style={styles.actionButtonText}>{t('startAnalysis')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, styles.marginTopButton]}
              onPress={navigateToBeforeAfterAnalysis}
            >
              <MaterialIcons name="compare" size={24} color="white" />
              <Text style={styles.actionButtonText}>{t('beforeAfterAnalysis')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>{t('eliteAnalysisFeatures')}</Text>

            <View style={styles.featureCard}>
              <MaterialIcons name="face" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{t('dermaGraphAnalysis')}</Text>
                <Text style={styles.featureDescription}>
                  {t('dermaGraphDescription')}
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <MaterialIcons name="healing" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{t('rejuvenationRx')}</Text>
                <Text style={styles.featureDescription}>
                  {t('rejuvenationDescription')}
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <MaterialIcons name="auto-fix-high" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{t('treatmentVision')}</Text>
                <Text style={styles.featureDescription}>
                  {t('treatmentVisionDescription')}
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <MaterialIcons name="analytics" size={24} color={COLORS.primary.main} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{t('beautyBlueprint')}</Text>
                <Text style={styles.featureDescription}>
                  {t('beautyBlueprintDescription')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>
              "{t('tagline')}"
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('privacyFirstDesign')}
            </Text>
            <TouchableOpacity
              onPress={navigateToPrivacyPolicy}
              style={styles.privacyLink}
            >
              <Text style={styles.privacyLinkText}>
                {t('viewPrivacyPolicy')}
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
    backgroundColor: COLORS.background.default,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  settingsButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  logo: {
    transform: [{ scale: 1.1 }],
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    marginBottom: 24,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    borderRadius: 16,
    width: '90%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
  },
  secondaryButton: {
    backgroundColor: COLORS.background.paper,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  secondaryButtonText: {
    color: COLORS.primary.main,
  },
  marginTopButton: {
    marginTop: 12,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background.paper,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  taglineContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  taglineText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  privacyLink: {
    alignSelf: 'center',
  },
  privacyLinkText: {
    fontSize: 14,
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error.main,
    textAlign: 'center',
  },
});

export default HomeScreen;
