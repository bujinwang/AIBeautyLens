import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import LogoIcon from '../components/LogoIcon';

const IconGenerator: React.FC = () => {
  const mainIconRef = useRef<ViewShot>(null);
  const adaptiveIconRef = useRef<ViewShot>(null);
  const splashIconRef = useRef<ViewShot>(null);

  useEffect(() => {
    const generateIcons = async () => {
      try {
        // Generate main icon
        if (mainIconRef.current) {
          const mainIconUri = await mainIconRef.current.capture();
          await FileSystem.copyAsync({
            from: mainIconUri,
            to: `${FileSystem.documentDirectory}icon.png`
          });
        }

        // Generate adaptive icon
        if (adaptiveIconRef.current) {
          const adaptiveIconUri = await adaptiveIconRef.current.capture();
          await FileSystem.copyAsync({
            from: adaptiveIconUri,
            to: `${FileSystem.documentDirectory}adaptive-icon.png`
          });
        }

        // Generate splash icon
        if (splashIconRef.current) {
          const splashIconUri = await splashIconRef.current.capture();
          await FileSystem.copyAsync({
            from: splashIconUri,
            to: `${FileSystem.documentDirectory}splash.png`
          });
        }

        console.log('Icons generated successfully');
      } catch (error) {
        console.error('Error generating icons:', error);
      }
    };

    generateIcons();
  }, []);

  return (
    <View style={styles.container}>
      <ViewShot ref={mainIconRef} options={{ format: 'png', quality: 1, width: 1024, height: 1024 }}>
        <View style={styles.iconContainer}>
          <LogoIcon size={1024} color="primary" />
        </View>
      </ViewShot>

      <ViewShot ref={adaptiveIconRef} options={{ format: 'png', quality: 1, width: 1024, height: 1024 }}>
        <View style={[styles.iconContainer, styles.darkBackground]}>
          <LogoIcon size={1024} color="white" />
        </View>
      </ViewShot>

      <ViewShot ref={splashIconRef} options={{ format: 'png', quality: 1, width: 1242, height: 2436 }}>
        <View style={[styles.splashContainer, styles.darkBackground]}>
          <LogoIcon size={400} color="white" />
        </View>
      </ViewShot>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  iconContainer: {
    width: 1024,
    height: 1024,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  darkBackground: {
    backgroundColor: '#1E3A8A',
  },
  splashContainer: {
    width: 1242,
    height: 2436,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconGenerator; 