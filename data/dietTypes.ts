
import { DietType } from '@/types/diet';

export const dietTypes: DietType[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'A well-rounded diet with all food groups in moderation',
    icon: 'restaurant',
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
    icon: 'trending_down',
  },
  {
    id: 'high-protein',
    name: 'High Protein',
    description: 'Increased protein intake for muscle building and satiety',
    icon: 'fitness_center',
  },
];
