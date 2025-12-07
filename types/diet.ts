
export interface DietType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
}

export interface Menu {
  id: string;
  date: string;
  dietType: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
  totalCalories: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  currentDiet: string;
  preferences: {
    allergies: string[];
    dislikes: string[];
    calorieGoal: number;
  };
}
