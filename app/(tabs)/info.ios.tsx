
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { logNavigation } from '@/utils/activityLogger';
import { useAuth } from '@/contexts/AuthContext';

export default function InfoScreen() {
  const { user } = useAuth();

  React.useEffect(() => {
    logNavigation('SCREEN_VIEW', 'User viewed Info screen', { userId: user?.id }, user?.id, user?.name);
  }, []);

  const handleEmailSupport = () => {
    logNavigation('SUPPORT_CONTACT', 'User initiated email support', {}, user?.id, user?.name);
    Linking.openURL('mailto:support@menuer.app?subject=Support Request');
  };

  const handleOpenWebsite = () => {
    logNavigation('WEBSITE_VISIT', 'User opened website', {}, user?.id, user?.name);
    Linking.openURL('https://menuer.app');
  };

  const howItWorksSteps = [
    {
      number: 1,
      icon: 'fork.knife',
      androidIcon: 'restaurant',
      title: 'Choose Your Diet',
      description: 'Select from various diet types including Keto, Vegan, Mediterranean, and more.',
      color: colors.primary,
    },
    {
      number: 2,
      icon: 'target',
      androidIcon: 'flag',
      title: 'Set Your Goals',
      description: 'Define your weight goals, dietary preferences, and timeline.',
      color: colors.secondary,
    },
    {
      number: 3,
      icon: 'sparkles',
      androidIcon: 'auto_awesome',
      title: 'Generate Menus',
      description: 'AI-powered menu generation creates personalized meal plans instantly.',
      color: colors.accent,
    },
    {
      number: 4,
      icon: 'chart.line.uptrend.xyaxis',
      androidIcon: 'trending_up',
      title: 'Track Progress',
      description: 'Monitor your weight, calories, and diet journey over time.',
      color: colors.success,
    },
  ];

  const supportOptions = [
    {
      icon: 'mail',
      androidIcon: 'email',
      title: 'Email Support',
      description: 'Get help via email',
      onPress: handleEmailSupport,
    },
    {
      icon: 'globe',
      androidIcon: 'language',
      title: 'Visit Website',
      description: 'Learn more about Menuer',
      onPress: handleOpenWebsite,
    },
  ];

  const policyOptions = [
    {
      icon: 'shield.checkered',
      androidIcon: 'privacy_tip',
      title: 'Privacy Policy',
      description: 'How we protect your data',
      onPress: () => {
        logNavigation('POLICY_VIEW', 'User viewed Privacy Policy', {}, user?.id, user?.name);
        Alert.alert('Privacy Policy', 'Your privacy is important to us. We collect minimal data and never share your information with third parties.');
      },
    },
    {
      icon: 'doc.text',
      androidIcon: 'description',
      title: 'Terms of Service',
      description: 'Terms and conditions',
      onPress: () => {
        logNavigation('POLICY_VIEW', 'User viewed Terms of Service', {}, user?.id, user?.name);
        Alert.alert('Terms of Service', 'By using Menuer, you agree to our terms of service. Please use the app responsibly.');
      },
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol 
          ios_icon_name="info.circle.fill" 
          android_material_icon_name="info" 
          size={48} 
          color={colors.primary}
        />
        <Text style={styles.headerTitle}>Information</Text>
        <Text style={styles.headerSubtitle}>Everything you need to know about Menuer</Text>
      </View>

      {/* How It Works Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        {howItWorksSteps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={styles.stepCard}>
              <View style={[styles.stepIconContainer, { backgroundColor: step.color }]}>
                <Text style={styles.stepNumber}>{step.number}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <IconSymbol 
                    ios_icon_name={step.icon} 
                    android_material_icon_name={step.androidIcon as any} 
                    size={24} 
                    color={step.color}
                  />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {supportOptions.map((option, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={styles.optionIconContainer}>
                <IconSymbol 
                  ios_icon_name={option.icon} 
                  android_material_icon_name={option.androidIcon as any} 
                  size={24} 
                  color={colors.primary}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {/* Policies Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policies</Text>
        {policyOptions.map((option, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={styles.optionIconContainer}>
                <IconSymbol 
                  ios_icon_name={option.icon} 
                  android_material_icon_name={option.androidIcon as any} 
                  size={24} 
                  color={colors.secondary}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Menuer v1.0.0</Text>
        <Text style={styles.versionSubtext}>Made with ❤️ for healthy living</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
