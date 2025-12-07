
import { DietType } from '@/types/diet';

export const dietTypes: DietType[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'A well-rounded diet with all food groups in moderation',
    icon: 'restaurant',
  },
  {
    id: 'weight-loss',
    name: 'Weight Loss',
    description: 'Calorie deficit diet designed to help you lose weight safely',
    icon: 'trending_down',
  },
  {
    id: 'muscle-gain',
    name: 'Muscle Gain',
    description: 'High protein diet with calorie surplus for building muscle mass',
    icon: 'fitness_center',
  },
  {
    id: 'weight-gain',
    name: 'Weight Gain',
    description: 'Calorie surplus diet to help you gain healthy weight',
    icon: 'trending_up',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Maintain your current weight with balanced nutrition',
    icon: 'balance',
  },
  {
    id: 'athletic-performance',
    name: 'Athletic Performance',
    description: 'Optimized nutrition for athletes and active individuals',
    icon: 'sports',
  },
  {
    id: 'keto',
    name: 'Keto',
    description: 'Low-carb, high-fat diet for ketosis',
    icon: 'local_fire_department',
  },
  {
    id: 'vegan',
    name: 'Vegan',
    description: 'Plant-based diet excluding all animal products',
    icon: 'eco',
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    description: 'Plant-based diet that may include dairy and eggs',
    icon: 'spa',
  },
  {
    id: 'paleo',
    name: 'Paleo',
    description: 'Diet based on foods similar to what might have been eaten during the Paleolithic era',
    icon: 'nature_people',
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    description: 'Diet inspired by eating patterns of countries bordering the Mediterranean Sea',
    icon: 'sailing',
  },
  {
    id: 'low-carb',
    name: 'Low Carb',
    description: 'Reduced carbohydrate intake for weight management',
    icon: 'remove_circle',
  },
  {
    id: 'high-protein',
    name: 'High Protein',
    description: 'Increased protein intake for muscle building and satiety',
    icon: 'egg',
  },
  {
    id: 'intermittent-fasting',
    name: 'Intermittent Fasting',
    description: 'Time-restricted eating pattern for weight management',
    icon: 'schedule',
  },
  {
    id: 'clean-eating',
    name: 'Clean Eating',
    description: 'Focus on whole, unprocessed foods for optimal health',
    icon: 'health_and_safety',
  },
];
