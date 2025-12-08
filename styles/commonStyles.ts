
import { StyleSheet } from 'react-native';

export const colors = {
  // Purple-based color scheme inspired by the design images
  background: '#FFFFFF',        // Pure white background
  text: '#1A1A2E',             // Dark navy text
  textSecondary: '#6B7280',    // Medium gray
  primary: '#7C3AED',          // Vibrant purple (main brand color)
  secondary: '#A78BFA',        // Light purple
  accent: '#EC4899',           // Pink accent
  card: '#FFFFFF',             // Pure white cards
  highlight: '#F3F4F6',        // Very light gray for subtle backgrounds
  navy: '#1E3A8A',             // Navy blue
  lightPurple: '#EDE9FE',      // Very light purple
  success: '#10B981',          // Green for success
  warning: '#F59E0B',          // Orange for warnings
  error: '#EF4444',            // Red for errors
  purple: '#7C3AED',           // Main purple
  darkPurple: '#5B21B6',       // Dark purple
  lightGray: '#F9FAFB',        // Light gray background
  mediumGray: '#9CA3AF',       // Medium gray
  darkGray: '#374151',         // Dark gray
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.lightPurple,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 12px rgba(124, 58, 237, 0.1)',
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
});
