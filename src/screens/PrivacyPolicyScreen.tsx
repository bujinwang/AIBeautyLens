import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Linking,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

type Props = {
  navigation: PrivacyPolicyScreenNavigationProp;
};

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  console.log('PrivacyPolicyScreen: Component mounted');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          AIBeautyLens collects and processes facial images solely for providing personalized skincare recommendations. Images are captured through your device camera or selected from your photo library.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          • Analyze facial features and skin conditions{'\n'}
          • Generate personalized skincare recommendations{'\n'}
          • Create treatment simulations{'\n'}
          • Provide before/after comparisons
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.text}>
          • All facial images are processed with encryption{'\n'}
          • Images are stored temporarily on your device only{'\n'}
          • No permanent storage of facial data{'\n'}
          • No facial recognition or biometric data collection
        </Text>

        <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
        <Text style={styles.text}>
          Images are securely transmitted to Google Gemini Vision API for analysis. No data is shared with other third parties or used for identification or tracking purposes.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.text}>
          • Images are automatically deleted after analysis{'\n'}
          • No long-term storage of facial data{'\n'}
          • Users can manually delete images at any time
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to:{'\n'}
          • Access your data{'\n'}
          • Delete your data{'\n'}
          • Opt-out of data collection
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.text}>
          For any privacy-related questions or concerns, please contact us at:
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@autobebesys.com')}>
          <Text style={styles.link}>support@autobbebesys.com</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  lastUpdated: {
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  link: {
    color: '#1E3A8A',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default PrivacyPolicyScreen;