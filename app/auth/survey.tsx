
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { dietTypes } from '@/data/dietTypes';
import { logAuth, logProfile } from '@/utils/activityLogger';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SurveyScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Survey data
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [goals, setGoals] = useState('');
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // 90 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<typeof dietTypes[0] | null>(null);

  const totalSteps = 6;

  React.useEffect(() => {
    logAuth('SURVEY_STARTED', `User ${user?.name} started onboarding survey`, { userId: user?.id }, user?.id, user?.name);
  }, []);

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1 && !weight) {
      Alert.alert('Required', 'Please enter your weight');
      return;
    }
    if (currentStep === 2 && !age) {
      Alert.alert('Required', 'Please enter your age');
      return;
    }
    if (currentStep === 3 && !height) {
      Alert.alert('Required', 'Please enter your height');
      return;
    }
    if (currentStep === 4 && !goals) {
      Alert.alert('Required', 'Please enter your goals');
      return;
    }
    if (currentStep === 6 && !selectedDiet) {
      Alert.alert('Required', 'Please select a diet');
      return;
    }

    if (currentStep < totalSteps) {
      logProfile('SURVEY_STEP_COMPLETED', `User completed survey step ${currentStep}`, { step: currentStep, userId: user?.id }, user?.id, user?.name);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!selectedDiet) {
      Alert.alert('Required', 'Please select a diet');
      return;
    }

    setIsLoading(true);
    try {
      const surveyData = {
        weight: parseFloat(weight),
        age: parseInt(age),
        height: parseFloat(height),
        goals,
        dietEndDate: endDate.toISOString(),
        selectedDiet: selectedDiet.id,
        surveyCompletedAt: new Date().toISOString(),
      };

      console.log('Saving survey data:', surveyData);

      // Update user profile with survey data
      await updateUserProfile(surveyData);

      // Log the completion with all data
      await logAuth('SURVEY_COMPLETED', `User ${user?.name} completed onboarding survey`, {
        userId: user?.id,
        surveyData,
      }, user?.id, user?.name);

      // Log individual survey responses for detailed tracking
      await logProfile('WEIGHT_RECORDED', `Weight: ${weight} kg`, { weight: parseFloat(weight), userId: user?.id }, user?.id, user?.name);
      await logProfile('AGE_RECORDED', `Age: ${age} years`, { age: parseInt(age), userId: user?.id }, user?.id, user?.name);
      await logProfile('HEIGHT_RECORDED', `Height: ${height} cm`, { height: parseFloat(height), userId: user?.id }, user?.id, user?.name);
      await logProfile('GOALS_RECORDED', `Goals: ${goals}`, { goals, userId: user?.id }, user?.id, user?.name);
      await logProfile('END_DATE_RECORDED', `Diet end date: ${endDate.toLocaleDateString()}`, { endDate: endDate.toISOString(), userId: user?.id }, user?.id, user?.name);
      await logProfile('DIET_SELECTED', `Selected diet: ${selectedDiet.name}`, { diet: selectedDiet, userId: user?.id }, user?.id, user?.name);

      console.log('Survey completed successfully, navigating to dashboard');
      Alert.alert('Success', 'Your profile has been set up!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)/dashboard'),
        },
      ]);
    } catch (error) {
      console.log('Error saving survey data:', error);
      await logAuth('SURVEY_ERROR', `Survey completion failed for ${user?.name}`, { error: String(error), userId: user?.id }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="scalemass" 
                android_material_icon_name="monitor_weight" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>What&apos;s your weight?</Text>
            <Text style={styles.stepSubtitle}>This helps us create a personalized meal plan</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter weight"
                placeholderTextColor={colors.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="cake" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>How old are you?</Text>
            <Text style={styles.stepSubtitle}>Age helps us calculate your nutritional needs</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter age"
                placeholderTextColor={colors.textSecondary}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
              <Text style={styles.inputUnit}>years</Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="ruler" 
                android_material_icon_name="straighten" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>What&apos;s your height?</Text>
            <Text style={styles.stepSubtitle}>Height is important for calculating your BMI</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter height"
                placeholderTextColor={colors.textSecondary}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="target" 
                android_material_icon_name="flag" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>What are your goals?</Text>
            <Text style={styles.stepSubtitle}>Tell us what you want to achieve</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="E.g., Lose 10kg, build muscle, eat healthier..."
              placeholderTextColor={colors.textSecondary}
              value={goals}
              onChangeText={setGoals}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="calendar.badge.clock" 
                android_material_icon_name="event" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>When do you want to reach your goal?</Text>
            <Text style={styles.stepSubtitle}>Set a target date for your diet plan</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="calendar_today" 
                size={24} 
                color={colors.primary}
              />
              <Text style={styles.dateButtonText}>
                {endDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="fork.knife" 
                android_material_icon_name="restaurant" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>Choose your diet</Text>
            <Text style={styles.stepSubtitle}>Select the diet plan that fits your lifestyle</Text>
            <ScrollView 
              style={styles.dietList}
              showsVerticalScrollIndicator={false}
            >
              {dietTypes.map((diet, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity 
                    style={[
                      styles.dietCard,
                      selectedDiet?.id === diet.id && styles.dietCardSelected
                    ]}
                    onPress={() => setSelectedDiet(diet)}
                  >
                    <View style={[
                      styles.dietIconContainer,
                      selectedDiet?.id === diet.id && styles.dietIconContainerSelected
                    ]}>
                      <IconSymbol 
                        ios_icon_name={diet.icon} 
                        android_material_icon_name={diet.icon as any} 
                        size={24} 
                        color={selectedDiet?.id === diet.id ? colors.card : colors.primary}
                      />
                    </View>
                    <View style={styles.dietInfo}>
                      <Text style={styles.dietName}>{diet.name}</Text>
                      <Text style={styles.dietDescription}>{diet.description}</Text>
                    </View>
                    {selectedDiet?.id === diet.id && (
                      <IconSymbol 
                        ios_icon_name="checkmark.circle.fill" 
                        android_material_icon_name="check_circle" 
                        size={24} 
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderProgressBar()}
        {renderStep()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow_back" 
              size={20} 
              color={colors.text}
            />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < totalSteps ? (
          <TouchableOpacity 
            style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="arrow_forward" 
              size={20} 
              color={colors.card}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.completeButton, currentStep === 1 && styles.nextButtonFull]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <Text style={styles.completeButtonText}>Complete</Text>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.card}
                />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.highlight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  textArea: {
    height: 120,
    textAlign: 'left',
    paddingTop: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
    width: '100%',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  dietList: {
    width: '100%',
    maxHeight: 400,
  },
  dietCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dietCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  dietIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dietIconContainerSelected: {
    backgroundColor: colors.primary,
  },
  dietInfo: {
    flex: 1,
  },
  dietName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  dietDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
    marginRight: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 18,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
    marginRight: 8,
  },
});
