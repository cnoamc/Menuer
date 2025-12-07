
import { Platform, Image, View, StyleSheet } from 'react-native';
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
            <View style={styles.headerLogoContainer}>
              <Image 
                source={require('@/assets/images/829c1696-96c0-40ad-9f04-30502826062f.png')}
                style={styles.headerLogo}
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
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
});
