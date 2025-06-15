import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';
import authService from '../services/authService';
import { useError } from './ErrorContext';

// Define the context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'clinician' | 'patient', organizationId?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string; profileImage?: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const { captureError, showError } = useError();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        
        if (isAuthenticated) {
          const user = await authService.getCurrentUser();
          setState({
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication check failed',
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const user = await authService.login({ email, password });
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Login failed'));
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, role: 'clinician' | 'patient', organizationId?: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const user = await authService.register({ email, password, name, role, organizationId });
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Registration failed'));
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  // Logout function
  const logout = async () => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      await authService.logout();
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Logout failed'));
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  };

  // Update profile function
  const updateProfile = async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string; profileImage?: string }) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      const updatedUser = await authService.updateProfile(data);
      setState({
        ...state,
        user: updatedUser,
        isLoading: false,
        error: null,
      });
      showError('Profile updated successfully', 'success');
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Profile update failed'));
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      });
    }
  };

  // Request password reset function
  const requestPasswordReset = async (email: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      await authService.requestPasswordReset({ email });
      setState({
        ...state,
        isLoading: false,
        error: null,
      });
      showError('Password reset instructions sent to your email', 'success');
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Password reset request failed'));
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset request failed',
      });
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      await authService.resetPassword({ token, password, confirmPassword });
      setState({
        ...state,
        isLoading: false,
        error: null,
      });
      showError('Password reset successful. You can now log in with your new password.', 'success');
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Password reset failed'));
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 