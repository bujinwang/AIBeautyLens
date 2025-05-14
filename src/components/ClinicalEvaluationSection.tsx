import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextStyle
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { useLocalization } from '../i18n/localizationContext';

interface ClinicalEvaluationSectionProps {
  patientId?: string; // Optional patient ID to save evaluations per patient
  analysisType: 'eye' | 'fullFace' | 'beforeAfter' | 'hairScalp'; // Type of analysis
  sessionId?: string; // Optional session ID
}

const ClinicalEvaluationSection: React.FC<ClinicalEvaluationSectionProps> = ({
  patientId = 'current_patient',
  analysisType,
  sessionId = new Date().toISOString()
}) => {
  const { t } = useLocalization();
  const [evaluationText, setEvaluationText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Create a unique key for storage
  const storageKey = `clinical_evaluation_${analysisType}_${patientId}_${sessionId}`;
  
  // Load any existing evaluation for this session
  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        const savedEvaluation = await AsyncStorage.getItem(storageKey);
        if (savedEvaluation) {
          setEvaluationText(savedEvaluation);
        }
      } catch (error) {
        console.error('Error loading clinical evaluation:', error);
      }
    };
    
    loadEvaluation();
  }, [storageKey]);
  
  // Save evaluation to AsyncStorage
  const saveEvaluation = async () => {
    if (!evaluationText.trim()) {
      return; // Don't save empty evaluations
    }
    
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(storageKey, evaluationText);
      setIsSaved(true);
      Alert.alert(t('evaluationSaved'));
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving clinical evaluation:', error);
      Alert.alert('Error', 'Failed to save evaluation');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="medical-services" size={24} color={COLORS.primary.main} />
        <Text style={styles.sectionTitle}>
          {t('clinicalEvaluation')}
        </Text>
      </View>
      
      <Text style={styles.inputLabel}>
        <MaterialIcons name="edit" size={16} color={COLORS.text.secondary} />
        {' '}{t('enterClinicalNotes')}
      </Text>
      
      <TextInput
        style={[
          styles.textInput,
          isFocused && styles.textInputFocused
        ]}
        multiline
        editable={true}
        placeholder={t('evaluationText')}
        value={evaluationText}
        onChangeText={setEvaluationText}
        textAlignVertical="top"
        autoCapitalize="sentences"
        autoCorrect={true}
        keyboardType="default"
        returnKeyType="done"
        placeholderTextColor={COLORS.text.hint}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      <TouchableOpacity 
        style={[
          styles.saveButton,
          isSaved && styles.savedButton
        ]} 
        onPress={saveEvaluation}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <MaterialIcons 
              name={isSaved ? "check" : "save"} 
              size={18} 
              color={COLORS.white} 
              style={styles.buttonIcon} 
            />
            <Text style={styles.buttonText}>
              {t(isSaved ? 'evaluationSaved' : 'saveEvaluation')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary.dark,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    height: 120,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
    textAlignVertical: 'top',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInputFocused: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  savedButton: {
    backgroundColor: COLORS.success.main,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClinicalEvaluationSection; 