
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu, DietType } from '@/types/diet';
import { logMenu, logDiet } from '@/utils/activityLogger';
import { useAuth } from './AuthContext';

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
        const parsedMenus = JSON.parse(menusData);
        setMenus(parsedMenus);
        await logMenu('MENUS_LOADED', `Loaded ${parsedMenus.length} menus from storage`, { count: parsedMenus.length });
      }
      if (dietData) {
        const parsedDiet = JSON.parse(dietData);
        setCurrentDietState(parsedDiet);
        await logDiet('DIET_LOADED', `Current diet loaded: ${parsedDiet.name}`, { dietId: parsedDiet.id, dietName: parsedDiet.name });
      }
    } catch (error) {
      console.log('Error loading data:', error);
      await logMenu('MENU_LOAD_ERROR', 'Failed to load menus or diet data', { error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentDiet = async (diet: DietType) => {
    try {
      console.log('Setting current diet:', diet.name);
      await logDiet('DIET_CHANGE_ATTEMPT', `User attempting to change diet to: ${diet.name}`, { dietId: diet.id, dietName: diet.name });
      
      await AsyncStorage.setItem('currentDiet', JSON.stringify(diet));
      setCurrentDietState(diet);
      
      await logDiet('DIET_CHANGE_SUCCESS', `Diet changed successfully to: ${diet.name}`, { dietId: diet.id, dietName: diet.name, description: diet.description });
    } catch (error) {
      console.log('Error setting diet:', error);
      await logDiet('DIET_CHANGE_ERROR', `Failed to change diet to: ${diet.name}`, { dietId: diet.id, error: String(error) });
    }
  };

  const generateMenu = async (): Promise<Menu> => {
    try {
      console.log('Generating new menu for diet:', currentDiet?.name);
      await logMenu('MENU_GENERATION_START', `Starting menu generation for diet: ${currentDiet?.name || 'General'}`, { dietType: currentDiet?.name });
      
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
      
      await logMenu('MENU_GENERATION_SUCCESS', `Menu generated successfully for ${currentDiet?.name || 'General'}`, {
        menuId: newMenu.id,
        dietType: newMenu.dietType,
        totalCalories: newMenu.totalCalories,
        mealCount: 3 + newMenu.snacks.length,
        date: newMenu.date,
      });
      
      return newMenu;
    } catch (error) {
      console.log('Error generating menu:', error);
      await logMenu('MENU_GENERATION_ERROR', `Failed to generate menu for ${currentDiet?.name || 'General'}`, { error: String(error), dietType: currentDiet?.name });
      throw error;
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
      const menuToDelete = menus.find(m => m.id === menuId);
      console.log('Deleting menu:', menuId);
      await logMenu('MENU_DELETE_ATTEMPT', `User attempting to delete menu: ${menuToDelete?.dietType || 'Unknown'}`, { menuId, dietType: menuToDelete?.dietType });
      
      const updatedMenus = menus.filter(menu => menu.id !== menuId);
      await AsyncStorage.setItem('menus', JSON.stringify(updatedMenus));
      setMenus(updatedMenus);
      
      await logMenu('MENU_DELETE_SUCCESS', `Menu deleted successfully: ${menuToDelete?.dietType || 'Unknown'}`, { menuId, dietType: menuToDelete?.dietType, date: menuToDelete?.date });
    } catch (error) {
      console.log('Error deleting menu:', error);
      await logMenu('MENU_DELETE_ERROR', `Failed to delete menu: ${menuId}`, { menuId, error: String(error) });
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
