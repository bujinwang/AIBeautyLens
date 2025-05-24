import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FeedbackButton } from './FeedbackButton';

export const withFeedbackButton = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithFeedbackButton: React.FC<P> = (props) => {
    return (
      <View style={styles.container}>
        <WrappedComponent {...props} />
        <FeedbackButton />
      </View>
    );
  };

  return WithFeedbackButton;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 