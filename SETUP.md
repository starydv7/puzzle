# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Development Server

```bash
npm start
```

## Step 3: Run on Your Device

### Option A: Using Expo Go (Recommended for Testing)
1. Install **Expo Go** app on your phone (iOS/Android)
2. Scan the QR code shown in terminal
3. App will load on your device

### Option B: Android Emulator
```bash
npm run android
```

### Option C: iOS Simulator (Mac only)
```bash
npm run ios
```

## 📱 Assets You Need to Add

Create these files in the `assets/` folder:

1. **icon.png** (1024×1024) - App icon
2. **splash.png** (1242×2436) - Splash screen image
3. **adaptive-icon.png** (1024×1024) - Android adaptive icon
4. **favicon.png** (48×48) - Web favicon

For now, the app will work without these, but you'll need them for Play Store submission.

## 🎨 Customization

### Add More Puzzles
Edit `data/puzzles.json` to add more puzzles to any level.

### Change Colors
Edit the color values in each screen's `StyleSheet`:
- Primary: `#4A90E2` (Blue)
- Success: `#4CAF50` (Green)
- Background: `#F5F5F5` (Light Gray)

### Add Sound Effects
1. Add audio files to `assets/sounds/`
2. Import `expo-av` Audio in screens
3. Play sounds on button clicks and correct answers

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Expo Go not connecting
- Make sure phone and computer are on same WiFi
- Try restarting Expo: `npm start -- --clear`

### Android build fails
- Make sure Android Studio is installed
- Check that ANDROID_HOME is set

## 📦 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## ✅ Pre-Launch Checklist

- [ ] Test all screens
- [ ] Test all puzzle types
- [ ] Verify progress saving works
- [ ] Test on real device
- [ ] Add app icon and splash screen
- [ ] Write privacy policy
- [ ] Prepare Play Store screenshots
- [ ] Test sound/music (if added)

