
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Navy Blue, Purple, White color scheme for Menuer
  background: '#F8F9FE',      // Very light blue-white
  text: '#1A1F3A',            // Dark navy (almost black)
  textSecondary: '#6B7280',   // Medium gray
  primary: '#4F46E5',         // Indigo/Purple
  secondary: '#7C3AED',       // Vibrant purple
  accent: '#EC4899',          // Pink accent
  card: '#FFFFFF',            // Pure white
  highlight: '#EEF2FF',       // Light indigo
  navy: '#1E3A8A',            // Navy blue
  lightPurple: '#DDD6FE',     // Light purple
  success: '#10B981',         // Green for success
  warning: '#F59E0B',         // Orange for warnings
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
    boxShadow: '0px 4px 12px rgba(79, 70, 229, 0.1)',
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.primary,
  },
});
