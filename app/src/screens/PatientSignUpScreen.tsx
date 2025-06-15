import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { useApi } from '../hooks/useApi';
import { useError } from '../contexts/ErrorContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

type PatientSignUpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PatientSignUp'
>;

type Props = {
  navigation: PatientSignUpScreenNavigationProp;
};

const PatientSignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { execute: registerPatient, loading } = useApi('post', '/auth/register-patient', null, { skipInitialFetch: true });
  const { showError } = useError();

  const handleNext = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    try {
      // In a real scenario, you might send basic info to backend for preliminary validation
      // or hold it in state and send all data on the final step.
      // For now, we'll simulate passing it to the next screen.
      navigation.navigate('PatientProfileSetup', {
        fullName,
        email,
        password,
      });
    } catch (error: any) {
      console.error('Sign up failed:', error);
      showError('Failed to proceed with sign up. Please try again.');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.header}>Create Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name (Required)"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email (Required)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password (Min 8 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button title="Next" onPress={handleNext} loading={loading} />
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
});

export default PatientSignUpScreen;