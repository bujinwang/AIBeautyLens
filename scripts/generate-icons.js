const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
const SOURCE_ICON = path.join(__dirname, '../assets/icon.png');
const IOS_ICON_DIR = path.join(__dirname, '../ios/AIBeautyLens/Images.xcassets/AppIcon.appiconset');
const ANDROID_ICON_DIR = path.join(__dirname, '../android/app/src/main/res');

async function generateIosIcons() {
  console.log('Generating iOS icons...');
  
  // Ensure the iOS icon directory exists
  if (!fs.existsSync(IOS_ICON_DIR)) {
    fs.mkdirSync(IOS_ICON_DIR, { recursive: true });
  }

  // Generate icons for each size
  for (const size of ICON_SIZES) {
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .toFile(path.join(IOS_ICON_DIR, `icon_${size}x${size}.png`));
    console.log(`Generated ${size}x${size} icon for iOS`);
  }
}

async function generateAndroidIcons() {
  console.log('Generating Android icons...');
  
  const ANDROID_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  // Generate icons for each Android density
  for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
    const dir = path.join(ANDROID_ICON_DIR, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(SOURCE_ICON)
      .resize(size, size)
      .toFile(path.join(dir, 'ic_launcher.png'));
    console.log(`Generated ${size}x${size} icon for Android (${folder})`);
  }
}

async function main() {
  try {
    await generateIosIcons();
    await generateAndroidIcons();
    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main(); 