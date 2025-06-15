import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Switch } from 'react-native';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { useApi } from '../hooks/useApi';
import { useError } from '../contexts/ErrorContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { encrypt } from '../utils/encryption';

type PatientProfileSetupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PatientProfileSetup'
>;

type PatientProfileSetupScreenRouteProp = RouteProp<
  RootStackParamList,
  'PatientProfileSetup'
>;

type Props = {
  navigation: PatientProfileSetupScreenNavigationProp;
  route: PatientProfileSetupScreenRouteProp;
};

const PatientProfileSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { fullName, email, password } = route.params;

  const [dateOfBirth, setDateOfBirth] = useState(''); // Consider using a proper DatePicker component
  const [gender, setGender] = useState(''); // Consider using a Dropdown/Picker component
  const [contactInfo, setContactInfo] = useState('');
  const [additionalPhiDetails, setAdditionalPhiDetails] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const { execute: completeRegistration, loading } = useApi('post', '/auth/register-patient', null, { skipInitialFetch: true });
  const { showError } = useError();

  const handleCompleteRegistration = async () => {
    if (!agreedToPrivacy) {
      Alert.alert('Validation Error', 'You must agree to the Privacy Policy and Terms of Service.');
      return;
    }

    try {
      const encryptedContactInfo = contactInfo ? await encrypt(contactInfo) : undefined;
      const encryptedAdditionalPhiDetails = additionalPhiDetails ? await encrypt(additionalPhiDetails) : undefined;

      const payload = {
        full_name: fullName,
        email: email,
        password: password,
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
        contact_info: encryptedContactInfo,
        additional_phi_details: encryptedAdditionalPhiDetails,
      };

      await completeRegistration(payload);

      Alert.alert('Success', 'Registration complete! Welcome to AIBeautyLens.');
      navigation.navigate('Home'); // Navigate to home screen after successful registration
    } catch (error: any) {
      console.error('Registration failed:', error);
      showError('Failed to complete registration. Please try again.');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.header}>Complete Your Profile (Optional)</Text>

        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Gender (e.g., Male, Female, Other)"
          value={gender}
          onChangeText={setGender}
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

        <View style={styles.privacyContainer}>
          <Switch
            value={agreedToPrivacy}
            onValueChange={setAgreedToPrivacy}
          />
          <Text style={styles.privacyText}>I agree to the Privacy Policy and Terms of Service.</Text>
        </View>

        <Button title="Complete Registration" onPress={handleCompleteRegistration} loading={loading} />
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
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyText: {
    marginLeft: 10,
    flexShrink: 1,
  },
});

export default PatientProfileSetupScreen;