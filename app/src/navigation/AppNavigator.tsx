import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ClinicianPatientRegistrationScreen from '../screens/ClinicianPatientRegistrationScreen';
import PatientSignUpScreen from '../screens/PatientSignUpScreen';
import PatientProfileSetupScreen from '../screens/PatientProfileSetupScreen';
import { RootStackParamList } from './RootStackParamList';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ClinicianPatientRegistration" component={ClinicianPatientRegistrationScreen} />
        <Stack.Screen name="PatientSignUp" component={PatientSignUpScreen} />
        <Stack.Screen name="PatientProfileSetup" component={PatientProfileSetupScreen} />
        {/* ... other screens ... */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;