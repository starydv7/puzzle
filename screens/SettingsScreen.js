import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Share, SafeAreaView } from 'react-native';
import { getSettings, saveSettings, resetProgress } from '../utils/storage';
import { exportProgressReport } from '../utils/exportProgress';
import { hapticFeedback } from '../utils/haptics';

const SettingsScreen = ({ navigation }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setSoundEnabled(settings.soundEnabled);
    setMusicEnabled(settings.musicEnabled);
  };

  const toggleSound = async () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    const settings = await getSettings();
    await saveSettings({ ...settings, soundEnabled: newSoundState });
  };

  const toggleMusic = async () => {
    const newMusicState = !musicEnabled;
    setMusicEnabled(newMusicState);
    const settings = await getSettings();
    await saveSettings({ ...settings, musicEnabled: newMusicState });
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            Alert.alert('Success', 'Progress has been reset.');
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleExportProgress = async () => {
    try {
      hapticFeedback.medium();
      const report = await exportProgressReport();
      await Share.share({
        message: report,
        title: 'Puzzle Fun Progress Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not export progress. Please try again.');
    }
  };

  const openAbout = () => {
    navigation.navigate('About');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={toggleSound}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Text style={styles.settingValue}>
              {soundEnabled ? '🔊 ON' : '🔇 OFF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={toggleMusic}>
            <Text style={styles.settingLabel}>Background Music</Text>
            <Text style={styles.settingValue}>
              {musicEnabled ? '🔊 ON' : '🔇 OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleResetProgress}>
            <Text style={styles.settingLabel}>Reset Progress</Text>
            <Text style={styles.settingValue}>⚠️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('Stats')}
          >
            <Text style={styles.settingLabel}>View Progress</Text>
            <Text style={styles.settingValue}>📊 →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={openPrivacyPolicy}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={openAbout}>
            <Text style={styles.settingLabel}>About</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportProgress}>
            <Text style={styles.settingLabel}>Export Progress</Text>
            <Text style={styles.settingValue}>📤</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🧩 Puzzle Fun for Kids{'\n'}
            Made with ❤️ for learning
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingBottom: 0,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;

