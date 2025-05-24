import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LogoIcon from '../components/LogoIcon';
import Logo from '../components/Logo';
import { COLORS } from '../constants/theme';

/**
 * LogoGenerator component
 * 
 * This component renders various versions of the app logo that can be captured
 * for use as app icons, splash screens, and other marketing materials.
 * 
 * To use:
 * 1. Navigate to this screen
 * 2. Take a screenshot of the desired logo version
 * 3. Use an image editor to crop and process as needed
 */
const LogoGenerator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AIBeautyLens Logo Generator</Text>
      <Text style={styles.subtitle}>Take screenshots of these logos for app icons and marketing</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Icons</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconItem}>
            <LogoIcon size={192} />
            <Text style={styles.iconLabel}>192×192</Text>
          </View>
          <View style={styles.iconItem}>
            <LogoIcon size={144} />
            <Text style={styles.iconLabel}>144×144</Text>
          </View>
          <View style={styles.iconItem}>
            <LogoIcon size={96} />
            <Text style={styles.iconLabel}>96×96</Text>
          </View>
          <View style={styles.iconItem}>
            <LogoIcon size={72} />
            <Text style={styles.iconLabel}>72×72</Text>
          </View>
          <View style={styles.iconItem}>
            <LogoIcon size={48} />
            <Text style={styles.iconLabel}>48×48</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>On Light Background</Text>
        <View style={styles.logoContainer}>
          <Logo size="large" color="primary" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>On Dark Background</Text>
        <View style={[styles.logoContainer, styles.darkContainer]}>
          <Logo size="large" color="white" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Splash Screen Logo</Text>
        <View style={styles.splashContainer}>
          <LogoIcon size={120} />
          <View style={styles.splashTextContainer}>
            <Logo size="large" color="primary" />
          </View>
        </View>
      </View>
      
      <Text style={styles.instructions}>
        Instructions: Take screenshots of the logos you need, then use an image editor to crop and save them.
        For app icons, export as PNG with transparency.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary.main,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconItem: {
    alignItems: 'center',
    margin: 8,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  logoContainer: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  darkContainer: {
    backgroundColor: COLORS.primary.main,
  },
  splashContainer: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  splashTextContainer: {
    marginTop: 20,
  },
  instructions: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.text.secondary,
    marginTop: 30,
    textAlign: 'center',
  },
});

export default LogoGenerator; 