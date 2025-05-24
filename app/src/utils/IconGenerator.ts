import { renderToString } from 'react-dom/server';
import React from 'react';
import LogoIcon from '../components/LogoIcon';
import fs from 'fs';
import path from 'path';

// Generate icon files
const generateIcons = () => {
  // Main app icon (1024x1024)
  const mainIcon = renderToString(
    React.createElement(LogoIcon, { size: 1024, color: 'primary' })
  );

  // Android adaptive icon (1024x1024)
  const adaptiveIcon = renderToString(
    React.createElement(LogoIcon, { size: 1024, color: 'white' })
  );

  // Splash screen (1242x2436)
  const splashScreen = renderToString(
    React.createElement(LogoIcon, { size: 400, color: 'white' })
  );

  // Save files
  const assetsDir = path.join(__dirname, '../../assets');
  
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), mainIcon);
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashScreen);
};

export default generateIcons; 