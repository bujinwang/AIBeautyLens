import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { encrypt } from '../utils/encryption';
import { useApi } from '../hooks/useApi';
import { useError } from '../contexts/ErrorContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

type ClinicianPatientRegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ClinicianPatientRegistration'
>;

type Props = {
  navigation: ClinicianPatientRegistrationScreenNavigationProp;
};

const ClinicianPatientRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [additionalPhiDetails, setAdditionalPhiDetails] = useState('');
  const { execute: postPatientRegistration, loading } = useApi('post', '/patients/register-by-clinician', null, { skipInitialFetch: true });
  const { showError } = useError();

  const handleRegisterPatient = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }

    try {
      const encryptedContactInfo = contactInfo ? await encrypt(contactInfo) : undefined;
      const encryptedAdditionalPhiDetails = additionalPhiDetails ? await encrypt(additionalPhiDetails) : undefined;

      const payload = {
        full_name: fullName,
        contact_info: encryptedContactInfo,
        additional_phi_details: encryptedAdditionalPhiDetails,
      };

      await postPatientRegistration(payload);

      Alert.alert('Success', 'Patient registered successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Patient registration failed:', error);
      showError('Failed to register patient. Please try again.');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.header}>Register New Patient</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name (Required)"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.textArea}
          placeholder="Contact Information (Optional, will be encrypted)"
          value={contactInfo}
          onChangeText={setContactInfo}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.textArea}
          placeholder="Additional PHI Details (Optional, will be encrypted)"
          value={additionalPhiDetails}
          onChangeText={setAdditionalPhiDetails}
          multiline
          numberOfLines={4}
        />

        <Button title="Register Patient" onPress={handleRegisterPatient} loading={loading} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});

export default ClinicianPatientRegistrationScreen;