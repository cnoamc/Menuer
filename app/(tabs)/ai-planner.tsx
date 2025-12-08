
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { logNavigation, logMenu } from '@/utils/activityLogger';
import * as ImagePicker from 'expo-image-picker';

interface MealPlan {
  id: string;
  date: string;
  targetCalories: number;
  meals: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
}

interface IngredientAnalysis {
  ingredients: string[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function AIPlannerScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { currentDiet, generateMenu } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCaloriePlanner, setShowCaloriePlanner] = useState(false);
  const [showMenuPlanner, setShowMenuPlanner] = useState(false);
  const [targetCalories, setTargetCalories] = useState('2000');
  const [dailyCalories, setDailyCalories] = useState('2000');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [analyzedImage, setAnalyzedImage] = useState<IngredientAnalysis | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      console.log('User not authenticated, redirecting to sign in');
      logNavigation('REDIRECT', 'User redirected to sign in (not authenticated)', { from: 'ai-planner', to: 'signin' });
      router.replace('/auth/signin');
    } else if (user) {
      logNavigation('SCREEN_VIEW', 'User viewed AI Planner screen', { userId: user.id }, user.id, user.name);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (currentDiet) {
      setSelectedDiet(currentDiet.name);
    }
  }, [currentDiet]);

  const handleAICamera = async () => {
    try {
      await logMenu('AI_CAMERA_OPEN', 'User opened AI camera for meal analysis', { userId: user?.id }, user?.id, user?.name);

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to use this feature.');
        await logMenu('AI_CAMERA_PERMISSION_DENIED', 'User denied camera permission', { userId: user?.id }, user?.id, user?.name);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await logMenu('AI_CAMERA_IMAGE_CAPTURED', 'User captured image for meal analysis', { 
          userId: user?.id,
          imageUri: result.assets[0].uri,
        }, user?.id, user?.name);

        setIsGenerating(true);
        
        // Simulate AI analysis (in production, this would call an AI API)
        setTimeout(() => {
          const mockAnalysis: IngredientAnalysis = {
            ingredients: ['Chicken breast', 'Brown rice', 'Broccoli', 'Olive oil', 'Garlic'],
            totalCalories: 450,
            protein: 35,
            carbs: 42,
            fats: 12,
          };
          
          setAnalyzedImage(mockAnalysis);
          setShowAnalysisModal(true);
          setIsGenerating(false);
          
          logMenu('AI_CAMERA_ANALYSIS_COMPLETE', 'AI meal analysis completed', {
            userId: user?.id,
            analysis: mockAnalysis,
          }, user?.id, user?.name);
        }, 2000);
      } else {
        await logMenu('AI_CAMERA_CANCELLED', 'User cancelled camera capture', { userId: user?.id }, user?.id, user?.name);
      }
    } catch (error) {
      console.log('AI Camera error:', error);
      await logMenu('AI_CAMERA_ERROR', 'Error using AI camera', { userId: user?.id, error: String(error) }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to use camera. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleImageLibrary = async () => {
    try {
      await logMenu('AI_IMAGE_LIBRARY_OPEN', 'User opened image library for meal analysis', { userId: user?.id }, user?.id, user?.name);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is required to use this feature.');
        await logMenu('AI_IMAGE_LIBRARY_PERMISSION_DENIED', 'User denied photo library permission', { userId: user?.id }, user?.id, user?.name);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await logMenu('AI_IMAGE_LIBRARY_IMAGE_SELECTED', 'User selected image for meal analysis', { 
          userId: user?.id,
          imageUri: result.assets[0].uri,
        }, user?.id, user?.name);

        setIsGenerating(true);
        
        // Simulate AI analysis
        setTimeout(() => {
          const mockAnalysis: IngredientAnalysis = {
            ingredients: ['Salmon fillet', 'Quinoa', 'Asparagus', 'Lemon', 'Butter'],
            totalCalories: 520,
            protein: 38,
            carbs: 45,
            fats: 18,
          };
          
          setAnalyzedImage(mockAnalysis);
          setShowAnalysisModal(true);
          setIsGenerating(false);
          
          logMenu('AI_IMAGE_LIBRARY_ANALYSIS_COMPLETE', 'AI meal analysis completed', {
            userId: user?.id,
            analysis: mockAnalysis,
          }, user?.id, user?.name);
        }, 2000);
      } else {
        await logMenu('AI_IMAGE_LIBRARY_CANCELLED', 'User cancelled image selection', { userId: user?.id }, user?.id, user?.name);
      }
    } catch (error) {
      console.log('Image Library error:', error);
      await logMenu('AI_IMAGE_LIBRARY_ERROR', 'Error using image library', { userId: user?.id, error: String(error) }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to access photo library. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleGenerateCalorieMealPlan = async () => {
    if (!targetCalories || parseInt(targetCalories) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid calorie target.');
      return;
    }

    try {
      await logMenu('CALORIE_MEAL_PLAN_START', 'User started calorie-based meal plan generation', {
        userId: user?.id,
        targetCalories: parseInt(targetCalories),
      }, user?.id, user?.name);

      setIsGenerating(true);
      
      // Simulate AI meal plan generation
      setTimeout(() => {
        const calories = parseInt(targetCalories);
        const newMealPlan: MealPlan = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          targetCalories: calories,
          meals: [
            {
              name: 'Breakfast',
              calories: Math.round(calories * 0.25),
              protein: Math.round(calories * 0.25 * 0.3 / 4),
              carbs: Math.round(calories * 0.25 * 0.5 / 4),
              fats: Math.round(calories * 0.25 * 0.2 / 9),
            },
            {
              name: 'Lunch',
              calories: Math.round(calories * 0.35),
              protein: Math.round(calories * 0.35 * 0.3 / 4),
              carbs: Math.round(calories * 0.35 * 0.5 / 4),
              fats: Math.round(calories * 0.35 * 0.2 / 9),
            },
            {
              name: 'Dinner',
              calories: Math.round(calories * 0.30),
              protein: Math.round(calories * 0.30 * 0.3 / 4),
              carbs: Math.round(calories * 0.30 * 0.5 / 4),
              fats: Math.round(calories * 0.30 * 0.2 / 9),
            },
            {
              name: 'Snacks',
              calories: Math.round(calories * 0.10),
              protein: Math.round(calories * 0.10 * 0.3 / 4),
              carbs: Math.round(calories * 0.10 * 0.5 / 4),
              fats: Math.round(calories * 0.10 * 0.2 / 9),
            },
          ],
        };

        setMealPlans([newMealPlan, ...mealPlans]);
        setIsGenerating(false);
        setShowCaloriePlanner(false);
        
        Alert.alert('Success', `Meal plan for ${calories} calories generated!`);
        
        logMenu('CALORIE_MEAL_PLAN_SUCCESS', 'Calorie-based meal plan generated successfully', {
          userId: user?.id,
          mealPlan: newMealPlan,
        }, user?.id, user?.name);
      }, 2000);
    } catch (error) {
      console.log('Generate calorie meal plan error:', error);
      await logMenu('CALORIE_MEAL_PLAN_ERROR', 'Error generating calorie-based meal plan', {
        userId: user?.id,
        targetCalories: parseInt(targetCalories),
        error: String(error),
      }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleGenerateMenuPlan = async () => {
    if (!dailyCalories || parseInt(dailyCalories) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid daily calorie target.');
      return;
    }

    if (!selectedDiet) {
      Alert.alert('Select Diet', 'Please select a diet type first.', [
        { 
          text: 'Select Diet', 
          onPress: () => {
            logNavigation('NAVIGATION', 'User navigating to Diet Selection from AI Planner', { from: 'ai-planner', to: 'diet-select' }, user?.id, user?.name);
            router.push('/diet/select');
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    try {
      await logMenu('MENU_PLAN_START', 'User started diet and calorie-based menu plan generation', {
        userId: user?.id,
        dailyCalories: parseInt(dailyCalories),
        diet: selectedDiet,
      }, user?.id, user?.name);

      setIsGenerating(true);
      
      // Generate menu using existing context
      await generateMenu();
      
      setIsGenerating(false);
      setShowMenuPlanner(false);
      
      Alert.alert('Success', `${selectedDiet} menu plan for ${dailyCalories} calories generated!`);
      
      logMenu('MENU_PLAN_SUCCESS', 'Diet and calorie-based menu plan generated successfully', {
        userId: user?.id,
        dailyCalories: parseInt(dailyCalories),
        diet: selectedDiet,
      }, user?.id, user?.name);
    } catch (error) {
      console.log('Generate menu plan error:', error);
      await logMenu('MENU_PLAN_ERROR', 'Error generating diet and calorie-based menu plan', {
        userId: user?.id,
        dailyCalories: parseInt(dailyCalories),
        diet: selectedDiet,
        error: String(error),
      }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to generate menu plan. Please try again.');
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>AI Planner</Text>
          <Text style={styles.pageSubtitle}>Smart meal planning powered by AI</Text>
        </View>
        <View style={styles.aiIconContainer}>
          <IconSymbol 
            ios_icon_name="sparkles" 
            android_material_icon_name="auto_awesome" 
            size={32} 
            color={colors.primary}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>AI Features</Text>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={handleAICamera}
        disabled={isGenerating}
      >
        <View style={styles.featureIconContainer}>
          <IconSymbol 
            ios_icon_name="camera.fill" 
            android_material_icon_name="camera_alt" 
            size={32} 
            color={colors.primary}
          />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>AI Camera</Text>
          <Text style={styles.featureDescription}>
            Capture a photo of your meal and let AI calculate ingredients and nutritional information
          </Text>
        </View>
        <IconSymbol 
          ios_icon_name="chevron.right" 
          android_material_icon_name="chevron_right" 
          size={24} 
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={handleImageLibrary}
        disabled={isGenerating}
      >
        <View style={styles.featureIconContainer}>
          <IconSymbol 
            ios_icon_name="photo.fill" 
            android_material_icon_name="photo_library" 
            size={32} 
            color={colors.secondary}
          />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Analyze from Gallery</Text>
          <Text style={styles.featureDescription}>
            Select a photo from your gallery to analyze meal ingredients and calories
          </Text>
        </View>
        <IconSymbol 
          ios_icon_name="chevron.right" 
          android_material_icon_name="chevron_right" 
          size={24} 
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => {
          setShowCaloriePlanner(true);
          logMenu('CALORIE_PLANNER_OPENED', 'User opened calorie-based meal planner', { userId: user?.id }, user?.id, user?.name);
        }}
        disabled={isGenerating}
      >
        <View style={styles.featureIconContainer}>
          <IconSymbol 
            ios_icon_name="flame.fill" 
            android_material_icon_name="local_fire_department" 
            size={32} 
            color={colors.accent}
          />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Meal Planner by Calories</Text>
          <Text style={styles.featureDescription}>
            Generate a meal plan based on your target calorie intake
          </Text>
        </View>
        <IconSymbol 
          ios_icon_name="chevron.right" 
          android_material_icon_name="chevron_right" 
          size={24} 
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.featureCard}
        onPress={() => {
          setShowMenuPlanner(true);
          logMenu('MENU_PLANNER_OPENED', 'User opened diet and calorie-based menu planner', { userId: user?.id }, user?.id, user?.name);
        }}
        disabled={isGenerating}
      >
        <View style={styles.featureIconContainer}>
          <IconSymbol 
            ios_icon_name="fork.knife" 
            android_material_icon_name="restaurant_menu" 
            size={32} 
            color={colors.success}
          />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Menu Planner by Diet & Calories</Text>
          <Text style={styles.featureDescription}>
            Create a complete menu tailored to your diet and daily calorie goals
          </Text>
        </View>
        <IconSymbol 
          ios_icon_name="chevron.right" 
          android_material_icon_name="chevron_right" 
          size={24} 
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {mealPlans.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Meal Plans</Text>
          {mealPlans.slice(0, 3).map((plan, index) => (
            <View key={index} style={styles.mealPlanCard}>
              <View style={styles.mealPlanHeader}>
                <Text style={styles.mealPlanTitle}>
                  {plan.targetCalories} Calorie Plan
                </Text>
                <Text style={styles.mealPlanDate}>
                  {new Date(plan.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.mealPlanMeals}>
                {plan.meals.map((meal, mealIndex) => (
                  <View key={mealIndex} style={styles.mealPlanMealRow}>
                    <Text style={styles.mealPlanMealName}>{meal.name}</Text>
                    <Text style={styles.mealPlanMealCalories}>{meal.calories} cal</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>
      )}

      <Modal
        visible={showCaloriePlanner}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCaloriePlanner(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meal Planner by Calories</Text>
              <TouchableOpacity onPress={() => setShowCaloriePlanner(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Target Calories</Text>
            <TextInput
              style={styles.input}
              value={targetCalories}
              onChangeText={setTargetCalories}
              keyboardType="numeric"
              placeholder="Enter target calories (e.g., 2000)"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateCalorieMealPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <>
                  <IconSymbol 
                    ios_icon_name="sparkles" 
                    android_material_icon_name="auto_awesome" 
                    size={24} 
                    color={colors.card}
                  />
                  <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMenuPlanner}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMenuPlanner(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu Planner</Text>
              <TouchableOpacity onPress={() => setShowMenuPlanner(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Daily Calories</Text>
            <TextInput
              style={styles.input}
              value={dailyCalories}
              onChangeText={setDailyCalories}
              keyboardType="numeric"
              placeholder="Enter daily calories (e.g., 2000)"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.modalLabel}>Diet Type</Text>
            <View style={styles.dietDisplay}>
              <Text style={styles.dietDisplayText}>
                {selectedDiet || 'No diet selected'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowMenuPlanner(false);
                  router.push('/diet/select');
                }}
              >
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateMenuPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <>
                  <IconSymbol 
                    ios_icon_name="sparkles" 
                    android_material_icon_name="auto_awesome" 
                    size={24} 
                    color={colors.card}
                  />
                  <Text style={styles.generateButtonText}>Generate Menu Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAnalysisModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnalysisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meal Analysis</Text>
              <TouchableOpacity onPress={() => setShowAnalysisModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {analyzedImage && (
              <>
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>Detected Ingredients</Text>
                  <View style={styles.ingredientsList}>
                    {analyzedImage.ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <IconSymbol 
                          ios_icon_name="checkmark.circle.fill" 
                          android_material_icon_name="check_circle" 
                          size={20} 
                          color={colors.success}
                        />
                        <Text style={styles.ingredientText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>Nutritional Information</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{analyzedImage.totalCalories}</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{analyzedImage.protein}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{analyzedImage.carbs}g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Fats</Text>
                      <Text style={styles.nutritionValue}>{analyzedImage.fats}g</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowAnalysisModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingOverlayText}>AI is analyzing...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aiIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mealPlanCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  mealPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  mealPlanDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mealPlanMeals: {
    gap: 8,
  },
  mealPlanMealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealPlanMealName: {
    fontSize: 14,
    color: colors.text,
  },
  mealPlanMealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  dietDisplay: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  dietDisplayText: {
    fontSize: 16,
    color: colors.text,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
    marginLeft: 12,
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    backgroundColor: colors.lightPurple,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  loadingOverlayText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
    fontWeight: '600',
  },
});
