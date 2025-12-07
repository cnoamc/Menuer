
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
  const [goalWeight, setGoalWeight] = useState('');
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // 90 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<typeof dietTypes[0] | null>(null);

  const totalSteps = 7;

  React.useEffect(() => {
    const surveyStartData = {
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
    };
    
    console.log('📋 Survey Started - User Data:', surveyStartData);
    logAuth('SURVEY_STARTED', `User ${user?.name} started onboarding survey`, surveyStartData, user?.id, user?.name);
  }, []);

  const handleNext = () => {
    // Validate current step and log the data
    if (currentStep === 1 && !weight) {
      Alert.alert('Required', 'Please enter your current weight');
      logProfile('SURVEY_VALIDATION_FAILED', 'Weight field validation failed - empty', { step: 1, userId: user?.id }, user?.id, user?.name);
      return;
    }
    if (currentStep === 1 && weight) {
      const weightData = { weight: parseFloat(weight), unit: 'kg', step: 1 };
      console.log('📋 Weight Recorded:', weightData);
      logProfile('SURVEY_WEIGHT_INPUT', `Current weight entered: ${weight} kg`, weightData, user?.id, user?.name);
    }

    if (currentStep === 2 && !goalWeight) {
      Alert.alert('Required', 'Please enter your goal weight');
      logProfile('SURVEY_VALIDATION_FAILED', 'Goal weight field validation failed - empty', { step: 2, userId: user?.id }, user?.id, user?.name);
      return;
    }
    if (currentStep === 2 && goalWeight) {
      const goalWeightData = { goalWeight: parseFloat(goalWeight), unit: 'kg', step: 2 };
      console.log('📋 Goal Weight Recorded:', goalWeightData);
      logProfile('SURVEY_GOAL_WEIGHT_INPUT', `Goal weight entered: ${goalWeight} kg`, goalWeightData, user?.id, user?.name);
    }

    if (currentStep === 3 && !age) {
      Alert.alert('Required', 'Please enter your age');
      logProfile('SURVEY_VALIDATION_FAILED', 'Age field validation failed - empty', { step: 3, userId: user?.id }, user?.id, user?.name);
      return;
    }
    if (currentStep === 3 && age) {
      const ageData = { age: parseInt(age), unit: 'years', step: 3 };
      console.log('📋 Age Recorded:', ageData);
      logProfile('SURVEY_AGE_INPUT', `Age entered: ${age} years`, ageData, user?.id, user?.name);
    }

    if (currentStep === 4 && !height) {
      Alert.alert('Required', 'Please enter your height');
      logProfile('SURVEY_VALIDATION_FAILED', 'Height field validation failed - empty', { step: 4, userId: user?.id }, user?.id, user?.name);
      return;
    }
    if (currentStep === 4 && height) {
      const heightData = { height: parseFloat(height), unit: 'cm', step: 4 };
      console.log('📋 Height Recorded:', heightData);
      logProfile('SURVEY_HEIGHT_INPUT', `Height entered: ${height} cm`, heightData, user?.id, user?.name);
    }

    if (currentStep === 5 && !goals) {
      Alert.alert('Required', 'Please enter your goals');
      logProfile('SURVEY_VALIDATION_FAILED', 'Goals field validation failed - empty', { step: 5, userId: user?.id }, user?.id, user?.name);
      return;
    }
    if (currentStep === 5 && goals) {
      const goalsData = { goals, goalsLength: goals.length, step: 5 };
      console.log('📋 Goals Recorded:', goalsData);
      logProfile('SURVEY_GOALS_INPUT', `Goals entered: ${goals}`, goalsData, user?.id, user?.name);
    }

    if (currentStep === 6 && endDate) {
      const endDateData = { 
        endDate: endDate.toISOString(), 
        endDateFormatted: endDate.toLocaleDateString(),
        daysUntilGoal: Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        step: 6 
      };
      console.log('📋 End Date Recorded:', endDateData);
      logProfile('SURVEY_END_DATE_INPUT', `Diet end date selected: ${endDate.toLocaleDateString()}`, endDateData, user?.id, user?.name);
    }

    if (currentStep === 7 && !selectedDiet) {
      Alert.alert('Required', 'Please select a diet');
      logProfile('SURVEY_VALIDATION_FAILED', 'Diet selection validation failed - no diet selected', { step: 7, userId: user?.id }, user?.id, user?.name);
      return;
    }

    if (currentStep < totalSteps) {
      const stepData = { 
        fromStep: currentStep, 
        toStep: currentStep + 1, 
        totalSteps,
        progress: `${currentStep}/${totalSteps}`,
        userId: user?.id 
      };
      console.log('📋 Survey Step Completed:', stepData);
      logProfile('SURVEY_STEP_COMPLETED', `User completed survey step ${currentStep}`, stepData, user?.id, user?.name);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const backData = { 
        fromStep: currentStep, 
        toStep: currentStep - 1, 
        userId: user?.id 
      };
      console.log('📋 Survey Step Back:', backData);
      logProfile('SURVEY_STEP_BACK', `User went back from step ${currentStep} to ${currentStep - 1}`, backData, user?.id, user?.name);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!selectedDiet) {
      Alert.alert('Required', 'Please select a diet');
      logProfile('SURVEY_VALIDATION_FAILED', 'Final validation failed - no diet selected', { step: 7, userId: user?.id }, user?.id, user?.name);
      return;
    }

    setIsLoading(true);
    
    try {
      const parsedWeight = parseFloat(weight);
      const parsedGoalWeight = parseFloat(goalWeight);
      const parsedAge = parseInt(age);
      const parsedHeight = parseFloat(height);
      
      // Calculate BMI
      const heightInMeters = parsedHeight / 100;
      const bmi = parsedWeight / (heightInMeters * heightInMeters);
      
      // Calculate days until goal
      const daysUntilGoal = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // Calculate weight difference
      const weightDifference = parsedGoalWeight - parsedWeight;
      const weightChangeType = weightDifference < 0 ? 'loss' : weightDifference > 0 ? 'gain' : 'maintenance';
      
      const surveyData = {
        initialWeight: parsedWeight,
        weight: parsedWeight,
        currentWeight: parsedWeight,
        goalWeight: parsedGoalWeight,
        age: parsedAge,
        height: parsedHeight,
        goals,
        dietEndDate: endDate.toISOString(),
        selectedDiet: selectedDiet.id,
        surveyCompletedAt: new Date().toISOString(),
        // Additional calculated fields for logging
        bmi: parseFloat(bmi.toFixed(2)),
        daysUntilGoal,
        weightDifference: parseFloat(weightDifference.toFixed(2)),
        weightChangeType,
        dietName: selectedDiet.name,
        dietDescription: selectedDiet.description,
      };

      console.log('📋 ===== COMPLETE SURVEY DATA =====');
      console.log('📋 User ID:', user?.id);
      console.log('📋 User Name:', user?.name);
      console.log('📋 User Email:', user?.email);
      console.log('📋 Initial Weight:', parsedWeight, 'kg');
      console.log('📋 Goal Weight:', parsedGoalWeight, 'kg');
      console.log('📋 Weight Difference:', weightDifference, 'kg');
      console.log('📋 Weight Change Type:', weightChangeType);
      console.log('📋 Age:', parsedAge, 'years');
      console.log('📋 Height:', parsedHeight, 'cm');
      console.log('📋 BMI:', bmi.toFixed(2));
      console.log('📋 Goals:', goals);
      console.log('📋 Diet End Date:', endDate.toISOString());
      console.log('📋 Days Until Goal:', daysUntilGoal);
      console.log('📋 Selected Diet:', selectedDiet.name);
      console.log('📋 Diet ID:', selectedDiet.id);
      console.log('📋 Diet Description:', selectedDiet.description);
      console.log('📋 Survey Completed At:', new Date().toISOString());
      console.log('📋 ==================================');

      // Update user profile with survey data
      await updateUserProfile(surveyData);
      console.log('✅ Survey data saved to user profile');

      // Log the completion with ALL data
      await logAuth('SURVEY_COMPLETED', `User ${user?.name} completed onboarding survey`, {
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        surveyData,
        completedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      // Log each individual field with detailed information
      await logProfile('INITIAL_WEIGHT_RECORDED', `Initial weight: ${weight} kg`, { 
        initialWeight: parsedWeight, 
        unit: 'kg',
        userId: user?.id,
        recordedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('GOAL_WEIGHT_RECORDED', `Goal weight: ${goalWeight} kg`, { 
        goalWeight: parsedGoalWeight, 
        unit: 'kg',
        weightDifference,
        weightChangeType,
        userId: user?.id,
        recordedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('AGE_RECORDED', `Age: ${age} years`, { 
        age: parsedAge, 
        unit: 'years',
        userId: user?.id,
        recordedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('HEIGHT_RECORDED', `Height: ${height} cm`, { 
        height: parsedHeight, 
        unit: 'cm',
        heightInMeters,
        userId: user?.id,
        recordedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('BMI_CALCULATED', `BMI calculated: ${bmi.toFixed(2)}`, { 
        bmi: parseFloat(bmi.toFixed(2)),
        weight: parsedWeight,
        height: parsedHeight,
        heightInMeters,
        userId: user?.id,
        calculatedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('GOALS_RECORDED', `Goals: ${goals}`, { 
        goals, 
        goalsLength: goals.length,
        userId: user?.id,
        recordedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('END_DATE_RECORDED', `Diet end date: ${endDate.toLocaleDateString()}`, { 
        endDate: endDate.toISOString(),
        endDateFormatted: endDate.toLocaleDateString(),
        daysUntilGoal,
        userId: user?.id,
        recordedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      await logProfile('DIET_SELECTED', `Selected diet: ${selectedDiet.name}`, { 
        dietId: selectedDiet.id,
        dietName: selectedDiet.name,
        dietDescription: selectedDiet.description,
        dietIcon: selectedDiet.icon,
        userId: user?.id,
        selectedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      // Log weight change plan
      await logProfile('WEIGHT_CHANGE_PLAN', `Weight change plan: ${weightChangeType}`, {
        currentWeight: parsedWeight,
        goalWeight: parsedGoalWeight,
        weightDifference,
        weightChangeType,
        daysUntilGoal,
        dailyWeightChange: parseFloat((weightDifference / daysUntilGoal).toFixed(3)),
        weeklyWeightChange: parseFloat((weightDifference / (daysUntilGoal / 7)).toFixed(3)),
        userId: user?.id,
        createdAt: new Date().toISOString(),
      }, user?.id, user?.name);

      // Log complete survey summary
      await logProfile('SURVEY_SUMMARY', 'Complete survey summary', {
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        physicalData: {
          initialWeight: parsedWeight,
          goalWeight: parsedGoalWeight,
          age: parsedAge,
          height: parsedHeight,
          bmi: parseFloat(bmi.toFixed(2)),
        },
        planData: {
          goals,
          dietEndDate: endDate.toISOString(),
          daysUntilGoal,
          selectedDiet: selectedDiet.name,
          dietId: selectedDiet.id,
        },
        calculatedData: {
          weightDifference,
          weightChangeType,
          dailyWeightChange: parseFloat((weightDifference / daysUntilGoal).toFixed(3)),
          weeklyWeightChange: parseFloat((weightDifference / (daysUntilGoal / 7)).toFixed(3)),
        },
        completedAt: new Date().toISOString(),
      }, user?.id, user?.name);

      console.log('✅ All survey data logged successfully');
      Alert.alert('Success', 'Your profile has been set up!', [
        {
          text: 'Continue',
          onPress: () => {
            console.log('📋 Navigating to dashboard after survey completion');
            logProfile('SURVEY_NAVIGATION', 'User navigating to dashboard after survey', { userId: user?.id }, user?.id, user?.name);
            router.replace('/(tabs)/dashboard');
          },
        },
      ]);
    } catch (error) {
      console.error('❌ Error saving survey data:', error);
      await logAuth('SURVEY_ERROR', `Survey completion failed for ${user?.name}`, { 
        error: String(error), 
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        userId: user?.id,
        failedAt: new Date().toISOString(),
      }, user?.id, user?.name);
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
            <Text style={styles.stepTitle}>What&apos;s your current weight?</Text>
            <Text style={styles.stepSubtitle}>This is your starting point for tracking progress</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter current weight"
                placeholderTextColor={colors.textSecondary}
                value={weight}
                onChangeText={(text) => {
                  setWeight(text);
                  console.log('📋 Weight input changed:', text);
                }}
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
                ios_icon_name="target" 
                android_material_icon_name="flag" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>What&apos;s your goal weight?</Text>
            <Text style={styles.stepSubtitle}>Set a realistic target weight you want to achieve</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter goal weight"
                placeholderTextColor={colors.textSecondary}
                value={goalWeight}
                onChangeText={(text) => {
                  setGoalWeight(text);
                  console.log('📋 Goal weight input changed:', text);
                }}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          </View>
        );

      case 3:
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
                onChangeText={(text) => {
                  setAge(text);
                  console.log('📋 Age input changed:', text);
                }}
                keyboardType="number-pad"
              />
              <Text style={styles.inputUnit}>years</Text>
            </View>
          </View>
        );

      case 4:
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
                onChangeText={(text) => {
                  setHeight(text);
                  console.log('📋 Height input changed:', text);
                }}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="star" 
                android_material_icon_name="star" 
                size={60} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.stepTitle}>What are your goals?</Text>
            <Text style={styles.stepSubtitle}>Tell us what you want to achieve</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="E.g., Lose weight, build muscle, eat healthier..."
              placeholderTextColor={colors.textSecondary}
              value={goals}
              onChangeText={(text) => {
                setGoals(text);
                console.log('📋 Goals input changed:', text);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );

      case 6:
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
              onPress={() => {
                setShowDatePicker(true);
                console.log('📋 Date picker opened');
              }}
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
                    console.log('📋 End date changed:', selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>
        );

      case 7:
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
                    onPress={() => {
                      setSelectedDiet(diet);
                      console.log('📋 Diet selected:', diet.name, '(ID:', diet.id, ')');
                      logProfile('SURVEY_DIET_SELECTION', `User selected diet: ${diet.name}`, { 
                        dietId: diet.id, 
                        dietName: diet.name,
                        step: 7,
                        userId: user?.id 
                      }, user?.id, user?.name);
                    }}
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
