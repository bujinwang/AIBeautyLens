export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ClinicianPatientRegistration: undefined;
  PatientSignUp: undefined;
  PatientProfileSetup: { fullName: string; email: string; password: string; };
  // Add other screens here as needed
};