import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import CharacterMascot from '../components/CharacterMascot';
import { hapticFeedback } from '../utils/haptics';

const AboutScreen = ({ navigation }) => {
  const appVersion = '1.0.0';
  const buildNumber = '1';

  const openPrivacyPolicy = () => {
    // In production, replace with actual URL
    const url = 'https://yourwebsite.com/privacy-policy';
    Linking.openURL(url).catch(() => {
      alert('Privacy policy will be available soon!');
    });
  };

  const openTerms = () => {
    const url = 'https://yourwebsite.com/terms';
    Linking.openURL(url).catch(() => {
      alert('Terms of service will be available soon!');
    });
  };

  const sendFeedback = () => {
    const email = 'support@puzzlefun.com';
    const subject = 'Feedback for Puzzle Fun';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url).catch(() => {
      alert('Email app not available. Please contact: ' + email);
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticFeedback.light();
            navigation.goBack();
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
      </View>

      <View style={styles.content}>
        <CharacterMascot
          emotion="happy"
          message="Thanks for playing Puzzle Fun! We hope you're having fun learning! 🎮"
          visible={true}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Puzzle Fun</Text>
          <Text style={styles.text}>
            Puzzle Fun is an educational game designed to help children develop critical thinking,
            pattern recognition, and problem-solving skills through engaging puzzles.
          </Text>
          <Text style={styles.text}>
            Our mission is to make learning fun and accessible for children of all ages, with
            age-appropriate content and a safe, ad-free environment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.feature}>🧩 54+ Educational Puzzles</Text>
          <Text style={styles.feature}>📖 Story Mode Adventures</Text>
          <Text style={styles.feature}>🔥 Daily Challenges</Text>
          <Text style={styles.feature}>🏆 Achievement System</Text>
          <Text style={styles.feature}>📊 Progress Tracking</Text>
          <Text style={styles.feature}>🎨 Child-Friendly Design</Text>
          <Text style={styles.feature}>🔒 100% Safe & Private</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build:</Text>
            <Text style={styles.infoValue}>{buildNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>React Native (Expo)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.linkButton} onPress={openPrivacyPolicy}>
            <Text style={styles.linkText}>📄 Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={openTerms}>
            <Text style={styles.linkText}>📋 Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.linkButton} onPress={sendFeedback}>
            <Text style={styles.linkText}>✉️ Send Feedback</Text>
          </TouchableOpacity>
          <Text style={styles.text}>
            We'd love to hear from you! Your feedback helps us make Puzzle Fun better.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for children's learning{'\n'}
            © 2024 Puzzle Fun. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
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
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  linkButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  linkText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AboutScreen;

