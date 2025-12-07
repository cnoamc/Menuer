
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu, DietType } from '@/types/diet';

interface MenuContextType {
  menus: Menu[];
  currentDiet: DietType | null;
  isLoading: boolean;
  setCurrentDiet: (diet: DietType) => void;
  generateMenu: () => Promise<Menu>;
  deleteMenu: (menuId: string) => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentDiet, setCurrentDietState] = useState<DietType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const menusData = await AsyncStorage.getItem('menus');
      const dietData = await AsyncStorage.getItem('currentDiet');
      
      if (menusData) {
        setMenus(JSON.parse(menusData));
      }
      if (dietData) {
        setCurrentDietState(JSON.parse(dietData));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentDiet = async (diet: DietType) => {
    try {
      await AsyncStorage.setItem('currentDiet', JSON.stringify(diet));
      setCurrentDietState(diet);
    } catch (error) {
      console.log('Error setting diet:', error);
    }
  };

  const generateMenu = async (): Promise<Menu> => {
    try {
      // Generate a mock menu - In production, this could call an AI API
      const newMenu: Menu = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        dietType: currentDiet?.name || 'General',
        breakfast: {
          id: '1',
          name: 'Avocado Toast with Eggs',
          description: 'Whole grain toast topped with mashed avocado and poached eggs',
          calories: 350,
          protein: 18,
          carbs: 32,
          fats: 16,
          ingredients: ['Whole grain bread', 'Avocado', 'Eggs', 'Salt', 'Pepper'],
        },
        lunch: {
          id: '2',
          name: 'Grilled Chicken Salad',
          description: 'Mixed greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette',
          calories: 420,
          protein: 35,
          carbs: 28,
          fats: 18,
          ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Balsamic vinegar'],
        },
        dinner: {
          id: '3',
          name: 'Baked Salmon with Quinoa',
          description: 'Herb-crusted salmon with quinoa and roasted vegetables',
          calories: 520,
          protein: 42,
          carbs: 45,
          fats: 22,
          ingredients: ['Salmon fillet', 'Quinoa', 'Broccoli', 'Carrots', 'Olive oil'],
        },
        snacks: [
          {
            id: '4',
            name: 'Greek Yogurt with Berries',
            description: 'Low-fat Greek yogurt topped with fresh berries',
            calories: 150,
            protein: 12,
            carbs: 20,
            fats: 3,
            ingredients: ['Greek yogurt', 'Blueberries', 'Strawberries', 'Honey'],
          },
        ],
        totalCalories: 1440,
      };

      const updatedMenus = [newMenu, ...menus];
      await AsyncStorage.setItem('menus', JSON.stringify(updatedMenus));
      setMenus(updatedMenus);
      
      return newMenu;
    } catch (error) {
      console.log('Error generating menu:', error);
      throw error;
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
      const updatedMenus = menus.filter(menu => menu.id !== menuId);
      await AsyncStorage.setItem('menus', JSON.stringify(updatedMenus));
      setMenus(updatedMenus);
    } catch (error) {
      console.log('Error deleting menu:', error);
      throw error;
    }
  };

  return (
    <MenuContext.Provider value={{ menus, currentDiet, isLoading, setCurrentDiet, generateMenu, deleteMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
