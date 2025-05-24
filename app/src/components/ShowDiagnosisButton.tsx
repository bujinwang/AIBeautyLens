import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import DiagnosisReportModal from './DiagnosisReportModal';
import { AnalysisResult } from '../types';
import ShowSkincareButton from './ShowSkincareButton';
import Button from './Button';
import SkinMatrixHeader from './SkinMatrixHeader';
import { useLocalization } from '../i18n/localizationContext';

interface ShowDiagnosisButtonProps {
  style?: object;
  analysisResult: AnalysisResult;
  imageUri?: string; // Optional patient image URI
}

const ShowDiagnosisButton: React.FC<ShowDiagnosisButtonProps> = ({
  style,
  analysisResult,
  imageUri
}) => {
  const { t } = useLocalization();
  const [modalVisible, setModalVisible] = useState(false);

  const handleShowReport = () => {
    if (!analysisResult) {
      console.warn('Analysis result is not available');
      return;
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleShowReport}
        activeOpacity={0.8}
        disabled={!analysisResult}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="assessment" size={20} color={COLORS.white} />
        </View>
        <Text style={styles.buttonText}>{t('showDiagnosisReport')}</Text>
      </TouchableOpacity>

      <DiagnosisReportModal
        visible={modalVisible}
        onClose={handleCloseModal}
        analysisResult={analysisResult}
        imageUri={imageUri}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  }
});

export default ShowDiagnosisButton;
