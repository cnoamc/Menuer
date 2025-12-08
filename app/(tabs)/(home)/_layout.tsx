
import { Platform, View, Image, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'Home',
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Image 
                source={require('@/assets/images/d40acc25-2499-4a19-9d5d-49e3d2291cf7.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          ),
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <Image 
                source={require('@/assets/images/d40acc25-2499-4a19-9d5d-49e3d2291cf7.png')}
                style={styles.headerLogoLeft}
                resizeMode="contain"
              />
            </View>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerLeftContainer: {
    marginLeft: 8,
  },
  headerLogoLeft: {
    width: 36,
    height: 36,
  },
});
