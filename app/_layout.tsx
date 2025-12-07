
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MenuProvider } from "@/contexts/MenuContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const inProtectedRoute = inTabsGroup || segments[0] === 'diet' || segments[0] === 'menus';

    console.log('Navigation check:', { user: !!user, inAuthGroup, inProtectedRoute, segments });

    if (!user && !inAuthGroup && inProtectedRoute) {
      // User is not signed in and trying to access protected route
      console.log('Redirecting to sign in - user not authenticated');
      router.replace('/auth/signin');
    } else if (user && inAuthGroup) {
      // User is signed in but on auth screen
      console.log('Redirecting to dashboard - user already authenticated');
      router.replace('/(tabs)/dashboard');
    }
  }, [user, segments, navigationState?.key, isLoading]);

  return (
    <Stack>
      {/* Auth Screens - Always accessible */}
      <Stack.Screen 
        name="auth/signin" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="auth/signup" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />

      {/* Main app with tabs - Protected */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Diet Selection - Protected */}
      <Stack.Screen 
        name="diet/select" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />

      {/* Menu Screens - Protected */}
      <Stack.Screen 
        name="menus/history" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="menus/[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />

      {/* Modal Demo Screens */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Standard Modal",
        }}
      />
      <Stack.Screen
        name="formsheet"
        options={{
          presentation: "formSheet",
          title: "Form Sheet Modal",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 0.8, 1.0],
          sheetCornerRadius: 20,
        }}
      />
      <Stack.Screen
        name="transparent-modal"
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)",
      background: "rgb(1, 1, 1)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <MenuProvider>
            <WidgetProvider>
              <GestureHandlerRootView>
                <RootLayoutNav />
                <SystemBars style={"auto"} />
              </GestureHandlerRootView>
            </WidgetProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
