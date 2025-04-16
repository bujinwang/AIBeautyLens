import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import SkincareAdviceModal from './SkincareAdviceModal';

interface ShowSkincareButtonProps {
  style?: object;
}

const ShowSkincareButton: React.FC<ShowSkincareButtonProps> = ({ style }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleShowAdvice = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.button, style]} 
        onPress={handleShowAdvice}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="spa" size={20} color={COLORS.white} />
        </View>
        <Text style={styles.buttonText}>Show Skincare Advice</Text>
      </TouchableOpacity>

      <SkincareAdviceModal 
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary.main,
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

export default ShowSkincareButton;
