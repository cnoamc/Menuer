
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useMenu } from '@/contexts/MenuContext';
import { dietTypes } from '@/data/dietTypes';

export default function SelectDietScreen() {
  const router = useRouter();
  const { currentDiet, setCurrentDiet } = useMenu();

  const handleSelectDiet = (diet: typeof dietTypes[0]) => {
    setCurrentDiet(diet);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Select Your Diet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Choose a diet plan that fits your lifestyle</Text>

        {dietTypes.map((diet, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity 
              style={[
                styles.dietCard,
                currentDiet?.id === diet.id && styles.dietCardSelected
              ]}
              onPress={() => handleSelectDiet(diet)}
            >
              <View style={styles.dietCardContent}>
                <View style={[
                  styles.dietIconContainer,
                  currentDiet?.id === diet.id && styles.dietIconContainerSelected
                ]}>
                  <IconSymbol 
                    ios_icon_name={diet.icon} 
                    android_material_icon_name={diet.icon as any} 
                    size={32} 
                    color={currentDiet?.id === diet.id ? colors.card : colors.primary}
                  />
                </View>
                <View style={styles.dietInfo}>
                  <Text style={styles.dietName}>{diet.name}</Text>
                  <Text style={styles.dietDescription}>{diet.description}</Text>
                </View>
                {currentDiet?.id === diet.id && (
                  <View style={styles.checkmark}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.primary}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  dietCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  dietCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  dietCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dietIconContainerSelected: {
    backgroundColor: colors.primary,
  },
  dietInfo: {
    flex: 1,
  },
  dietName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  dietDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checkmark: {
    marginLeft: 8,
  },
});
