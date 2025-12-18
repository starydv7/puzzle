import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { hapticFeedback } from '../utils/haptics';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
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
          <Text style={styles.title}>Privacy Policy</Text>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >

      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Puzzle Fun ("we", "our", or "us") is committed to protecting your privacy and your
            child's privacy. This Privacy Policy explains how we handle information in our
            educational puzzle game application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>We collect minimal information:</Text>
          </Text>
          <Text style={styles.text}>
            • Progress data (puzzles completed, stars earned) - stored locally on your device
          </Text>
          <Text style={styles.text}>
            • Settings preferences (sound, music) - stored locally on your device
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>We do NOT collect:</Text>
          </Text>
          <Text style={styles.text}>
            • Personal information (name, email, age)
          </Text>
          <Text style={styles.text}>
            • Location data
          </Text>
          <Text style={styles.text}>
            • Device identifiers
          </Text>
          <Text style={styles.text}>
            • Any data that can identify your child
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Information</Text>
          <Text style={styles.text}>
            All data is stored locally on your device and is used solely to:
          </Text>
          <Text style={styles.text}>
            • Track game progress
          </Text>
          <Text style={styles.text}>
            • Save your preferences
          </Text>
          <Text style={styles.text}>
            • Provide personalized learning experiences
          </Text>
          <Text style={styles.text}>
            We do not share, sell, or transmit any data to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Storage</Text>
          <Text style={styles.text}>
            All data is stored locally on your device using secure local storage. No data is
            transmitted to external servers. Your progress is completely private and under your
            control.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Children's Privacy (COPPA Compliance)</Text>
          <Text style={styles.text}>
            Puzzle Fun is designed for children and fully complies with the Children's Online
            Privacy Protection Act (COPPA):
          </Text>
          <Text style={styles.text}>
            • No personal information is collected from children
          </Text>
          <Text style={styles.text}>
            • No accounts or registration required
          </Text>
          <Text style={styles.text}>
            • No third-party advertising
          </Text>
          <Text style={styles.text}>
            • No data sharing with third parties
          </Text>
          <Text style={styles.text}>
            • All data remains on the device
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.text}>
            You have complete control over your data:
          </Text>
          <Text style={styles.text}>
            • Delete all data: Use "Reset Progress" in Settings
          </Text>
          <Text style={styles.text}>
            • No data collection means no data to request or delete
          </Text>
          <Text style={styles.text}>
            • Uninstall the app to remove all local data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
          <Text style={styles.text}>
            Puzzle Fun does not use any third-party analytics, advertising, or tracking services.
            The app works completely offline and does not require internet connectivity.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by updating the "Last Updated" date at the top of this policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.text}>
            If you have questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.text}>
            Email: privacy@puzzlefun.com
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This privacy policy ensures complete protection of children's privacy and complies
            with all applicable privacy laws including COPPA.
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
  lastUpdated: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;

