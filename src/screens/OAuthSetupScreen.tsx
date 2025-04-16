import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Linking, 
  Platform,
  ActivityIndicator,
  Switch
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { FontAwesome } from '@expo/vector-icons';
import { storeOAuthCredentials, initiateOAuth } from '../utils/oauth';
import { OAUTH_GOOGLE_SCOPES } from '../config/api';

// Define screen types
type OAuthSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OAuthSetup'>;
type OAuthSetupScreenRouteProp = RouteProp<RootStackParamList, 'OAuthSetup'>;

interface Props {
  navigation: OAuthSetupScreenNavigationProp;
  route: OAuthSetupScreenRouteProp;
}

const OAuthSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  // State for OAuth credentials
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [redirectUri, setRedirectUri] = useState<string>(Platform.OS === 'web' ? 'http://localhost:8080/oauth2callback' : 'com.yourdomain.aibeautylens:/oauth2callback');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    // Set up screen options
    navigation.setOptions({
      title: 'Google Cloud OAuth Setup',
      headerStyle: {
        backgroundColor: '#4285F4',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  // Function to open Google Cloud Console
  const openGoogleCloudConsole = () => {
    Linking.openURL('https://console.cloud.google.com/apis/credentials');
  };

  // Function to open Google Cloud API Library
  const openVertexAISetup = () => {
    Linking.openURL('https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com');
  };

  // Function to handle OAuth authentication
  const handleAuthenticate = async () => {
    // Validate inputs
    if (!clientId) {
      Alert.alert('Error', 'Client ID is required');
      return;
    }

    if (!redirectUri) {
      Alert.alert('Error', 'Redirect URI is required');
      return;
    }

    // Start authentication
    setIsAuthenticating(true);

    try {
      // Store credentials first
      await storeOAuthCredentials(clientId, clientSecret);

      // Create OAuth config
      const oauthConfig = {
        clientId,
        clientSecret: clientSecret || undefined,
        redirectUri,
        scopes: OAUTH_GOOGLE_SCOPES
      };

      // Initiate OAuth flow
      const success = await initiateOAuth(oauthConfig);

      if (success) {
        Alert.alert(
          'Authentication Successful',
          'Your app is now authorized to use Vertex AI services.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          'Unable to authenticate with Google Cloud. Please check your credentials and try again.'
        );
      }
    } catch (error) {
      console.error('OAuth error:', error);
      Alert.alert(
        'Authentication Error',
        `An error occurred during authentication: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <FontAwesome name="cloud" size={40} color="#4285F4" style={styles.icon} />
        <Text style={styles.title}>Google Cloud OAuth Setup</Text>
        <Text style={styles.subtitle}>
          Authenticate with Google Cloud to use Vertex AI for image generation
        </Text>
      </View>

      <TouchableOpacity
        style={styles.instructionsToggle}
        onPress={() => setShowInstructions(!showInstructions)}
      >
        <Text style={styles.instructionsToggleText}>
          {showInstructions ? 'Hide Setup Instructions' : 'Show Setup Instructions'}
        </Text>
        <FontAwesome
          name={showInstructions ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#4285F4"
        />
      </TouchableOpacity>

      {showInstructions && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to set up OAuth:</Text>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Go to the Google Cloud Console and create a project (or select an existing one)</Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={{flex: 1}}>
              <Text style={styles.stepText}>Enable the Vertex AI API in your project</Text>
              <TouchableOpacity
                style={styles.miniButton}
                onPress={openVertexAISetup}
              >
                <Text style={styles.miniButtonText}>Enable Vertex AI API</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Set up the OAuth consent screen (External type is fine for testing):
              {'\n'}- Add yourself as a test user
              {'\n'}- Add necessary scopes including "cloud-platform"
              {'\n'}- Set app name and user support email
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Create OAuth credentials in the "Credentials" section:
              {'\n'}- Click "Create Credentials" → "OAuth client ID"
              {'\n'}- For iOS apps: Use "iOS" type and enter bundle ID
              {'\n'}- For Android: Use "Android" type
              {'\n'}- For testing: Use "Web application" type
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>5</Text>
            <Text style={styles.stepText}>Add this exact redirect URI to your OAuth credentials:
              {'\n'}<Text style={styles.codeText}>{redirectUri}</Text>
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.openConsoleButton}
            onPress={openGoogleCloudConsole}
          >
            <FontAwesome name="external-link" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.openConsoleText}>Open Google Cloud Console</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>OAuth Credentials</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Client ID <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={clientId}
            onChangeText={setClientId}
            placeholder="Enter your Google OAuth Client ID"
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <Text style={styles.inputHelp}>Example format: 123456789012-abc123def456ghi789.apps.googleusercontent.com</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Redirect URI <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={redirectUri}
            onChangeText={setRedirectUri}
            placeholder="e.g., http://localhost:8080/oauth2callback"
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.advancedToggle}>
          <Text style={styles.advancedToggleText}>Show Advanced Options</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#4285F4" }}
            thumbColor={showAdvanced ? "#fff" : "#f4f3f4"}
            onValueChange={setShowAdvanced}
            value={showAdvanced}
          />
        </View>
        
        {showAdvanced && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Client Secret (optional for mobile)</Text>
            <TextInput
              style={styles.input}
              value={clientSecret}
              onChangeText={setClientSecret}
              placeholder="Enter your Google OAuth Client Secret"
              placeholderTextColor="#888"
              autoCapitalize="none"
              secureTextEntry
            />
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.button, isAuthenticating && styles.buttonDisabled]}
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome name="google" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Authenticate with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoCard}>
        <FontAwesome name="info-circle" size={20} color="#4A90E2" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          Authentication is required for Vertex AI image generation. After setup, the app will be able to generate high-quality treatment simulations.
        </Text>
      </View>

      <View style={styles.troubleshooting}>
        <Text style={styles.troubleshootingTitle}>Troubleshooting Tips:</Text>
        <View style={styles.troubleshootingItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.troubleshootingText}>Make sure you have enabled Vertex AI API in your Google Cloud project</Text>
        </View>
        <View style={styles.troubleshootingItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.troubleshootingText}>Verify that the redirect URI is exactly as shown above</Text>
        </View>
        <View style={styles.troubleshootingItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.troubleshootingText}>Ensure your OAuth client ID has cloud-platform scope in the consent screen</Text>
        </View>
        <View style={styles.troubleshootingItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.troubleshootingText}>You may need a billing account linked to your Google Cloud project</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionsToggleText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
    marginRight: 8,
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  openConsoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  openConsoleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  required: {
    color: '#E53935',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  inputHelp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a1c0fa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  miniButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 8,
  },
  miniButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeText: {
    fontFamily: 'monospace',
  },
  troubleshooting: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  troubleshootingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  troubleshootingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: 'bold',
  },
  troubleshootingText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});

export default OAuthSetupScreen; 