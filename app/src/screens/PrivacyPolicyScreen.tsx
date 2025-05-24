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
import { useLocalization } from '../i18n/localizationContext';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

type Props = {
  navigation: PrivacyPolicyScreenNavigationProp;
};

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLocalization();
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
        <Text style={styles.headerTitle}>{t('privacyPolicy')}</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>{t('lastUpdated')} {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>{t('infoWeCollect')}</Text>
        <Text style={styles.text}>
          {t('infoWeCollectText')}
        </Text>

        <Text style={styles.sectionTitle}>{t('howWeUseInfo')}</Text>
        <Text style={styles.text}>
          {t('howWeUseInfoText')}
        </Text>

        <Text style={styles.sectionTitle}>{t('dataStorage')}</Text>
        <Text style={styles.text}>
          {t('dataStorageText')}
        </Text>

        <Text style={styles.sectionTitle}>{t('thirdParty')}</Text>
        <Text style={styles.text}>
          {t('thirdPartyText')}
        </Text>

        <Text style={styles.sectionTitle}>{t('dataRetention')}</Text>
        <Text style={styles.text}>
          {t('dataRetentionText')}
        </Text>

        <Text style={styles.sectionTitle}>{t('yourRights')}</Text>
        <Text style={styles.text}>
          {t('yourRightsText')}
        </Text>

        <Text style={styles.sectionTitle}>{t('contactUs')}</Text>
        <Text style={styles.text}>
          {t('contactUsText')}
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
