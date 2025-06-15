export interface User {
  userId: string;
  email: string;
  name?: string;
  roles: string[];
  profileImageUrl?: string;
  clinicianId?: string;
  patientId?: string;
  organizationId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role: 'clinician' | 'patient';
  organizationId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  profileImage?: string; // base64 encoded image
} 