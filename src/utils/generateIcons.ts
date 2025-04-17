import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';

export const generateAppIcons = async () => {
  try {
    // Load the base icon image
    const iconAsset = Asset.fromModule(require('../assets/base-icon.png'));
    await iconAsset.downloadAsync();

    // Generate main app icon (1024x1024)
    const mainIcon = await ImageManipulator.manipulateAsync(
      iconAsset.localUri!,
      [{ resize: { width: 1024, height: 1024 } }],
      { format: 'png' }
    );

    // Save main icon
    await FileSystem.copyAsync({
      from: mainIcon.uri,
      to: `${FileSystem.documentDirectory}assets/icon.png`
    });

    // Generate adaptive icon (1024x1024)
    const adaptiveIcon = await ImageManipulator.manipulateAsync(
      iconAsset.localUri!,
      [
        { resize: { width: 1024, height: 1024 } },
        { flip: 'vertical' }  // Example transformation
      ],
      { format: 'png' }
    );

    // Save adaptive icon
    await FileSystem.copyAsync({
      from: adaptiveIcon.uri,
      to: `${FileSystem.documentDirectory}assets/adaptive-icon.png`
    });

    // Generate splash screen (1242x2436)
    const splashScreen = await ImageManipulator.manipulateAsync(
      iconAsset.localUri!,
      [{ resize: { width: 1242, height: 2436 } }],
      { format: 'png' }
    );

    // Save splash screen
    await FileSystem.copyAsync({
      from: splashScreen.uri,
      to: `${FileSystem.documentDirectory}assets/splash.png`
    });

    console.log('App icons generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating app icons:', error);
    return false;
  }
}; 