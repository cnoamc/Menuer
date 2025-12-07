
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useMenu } from '@/contexts/MenuContext';
import { Meal } from '@/types/diet';

export default function MenuDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { menus } = useMenu();

  const menu = menus.find(m => m.id === id);

  if (!menu) {
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
          <Text style={styles.title}>Menu Not Found</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
    );
  }

  const renderMealCard = (meal: Meal, mealType: string, icon: string) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealIconContainer}>
          <IconSymbol 
            ios_icon_name={icon} 
            android_material_icon_name={icon as any} 
            size={24} 
            color={colors.primary}
          />
        </View>
        <Text style={styles.mealType}>{mealType}</Text>
      </View>
      <Text style={styles.mealName}>{meal.name}</Text>
      <Text style={styles.mealDescription}>{meal.description}</Text>
      
      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.calories}</Text>
          <Text style={styles.macroLabel}>Calories</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.fats}g</Text>
          <Text style={styles.macroLabel}>Fats</Text>
        </View>
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.ingredientsTitle}>Ingredients:</Text>
        {meal.ingredients.map((ingredient, index) => (
          <React.Fragment key={index}>
            <View style={styles.ingredientItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );

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
        <Text style={styles.title}>Menu Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>{menu.dietType} Menu</Text>
              <Text style={styles.summaryDate}>
                {new Date(menu.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.totalCaloriesContainer}>
              <IconSymbol 
                ios_icon_name="flame.fill" 
                android_material_icon_name="local_fire_department" 
                size={32} 
                color={colors.accent}
              />
              <Text style={styles.totalCalories}>{menu.totalCalories}</Text>
              <Text style={styles.totalCaloriesLabel}>Total Calories</Text>
            </View>
          </View>
        </View>

        {renderMealCard(menu.breakfast, 'Breakfast', 'wb_sunny')}
        {renderMealCard(menu.lunch, 'Lunch', 'wb_twilight')}
        {renderMealCard(menu.dinner, 'Dinner', 'nightlight')}
        
        {menu.snacks.map((snack, index) => (
          <React.Fragment key={index}>
            {renderMealCard(snack, `Snack ${index + 1}`, 'cookie')}
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
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalCaloriesContainer: {
    alignItems: 'center',
  },
  totalCalories: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 4,
  },
  totalCaloriesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mealCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mealName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.highlight,
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ingredientsSection: {
    marginTop: 8,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});
