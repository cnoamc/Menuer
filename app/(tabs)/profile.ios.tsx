
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { colors } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut, updateUserProfile } = useAuth();
  const { menus, currentDiet } = useMenu();
  const [isEditingWeight, setIsEditingWeight] = React.useState(false);
  const [tempWeight, setTempWeight] = React.useState('');
  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [tempGoal, setTempGoal] = React.useState('');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState('');

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed sign out');
            try {
              await signOut();
              console.log('Sign out completed - navigation will be handled automatically');
            } catch (error) {
              console.log('Error during sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleUpdateWeight = async () => {
    const weight = parseFloat(tempWeight);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight');
      return;
    }
    await updateUserProfile({ currentWeight: weight });
    setIsEditingWeight(false);
    setTempWeight('');
  };

  const handleUpdateGoal = async () => {
    const goal = parseFloat(tempGoal);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid goal weight');
      return;
    }
    await updateUserProfile({ goalWeight: goal });
    setIsEditingGoal(false);
    setTempGoal('');
  };

  const handleUpdateName = async () => {
    if (!tempName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid name');
      return;
    }
    await updateUserProfile({ name: tempName.trim() });
    setIsEditingName(false);
    setTempName('');
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateUserProfile({ profileImage: result.assets[0].uri });
        console.log('Profile picture updated from camera');
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateUserProfile({ profileImage: result.assets[0].uri });
        console.log('Profile picture updated from gallery');
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notSignedInContainer}>
          <IconSymbol 
            ios_icon_name="person.circle" 
            android_material_icon_name="account_circle" 
            size={80} 
            color={theme.dark ? '#98989D' : '#666'}
          />
          <Text style={[styles.notSignedInTitle, { color: theme.colors.text }]}>Not Signed In</Text>
          <Text style={[styles.notSignedInText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Sign in to save your menus and track your progress
          </Text>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/auth/signin')}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const profileOptions = [
    {
      icon: 'restaurant',
      title: 'Current Diet',
      value: currentDiet ? currentDiet.name : 'Not selected',
      onPress: () => router.push('/diet/select'),
    },
    {
      icon: 'clock.fill',
      title: 'Menu History',
      value: `${menus.length} menus`,
      onPress: () => router.push('/menus/history'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <GlassView style={styles.profileHeader} glassEffectStyle="regular">
          <TouchableOpacity onPress={handleChangeProfilePicture} style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImageLarge}
              />
            ) : (
              <IconSymbol 
                ios_icon_name="person.circle.fill" 
                android_material_icon_name="account_circle" 
                size={100} 
                color={colors.primary} 
              />
            )}
            <View style={styles.editBadge}>
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="camera_alt" 
                size={16} 
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
          
          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={[styles.nameInput, { color: theme.colors.text, borderBottomColor: colors.primary }]}
                value={tempName}
                onChangeText={setTempName}
                placeholder={user.name}
                placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                autoFocus
              />
              <View style={styles.nameEditButtons}>
                <TouchableOpacity onPress={handleUpdateName} style={styles.iconButton}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={24} 
                    color={colors.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.iconButton}>
                  <IconSymbol 
                    ios_icon_name="xmark.circle.fill" 
                    android_material_icon_name="cancel" 
                    size={24} 
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => {
                setIsEditingName(true);
                setTempName(user.name);
              }}
              style={styles.nameContainer}
            >
              <Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text>
              <IconSymbol 
                ios_icon_name="pencil.circle" 
                android_material_icon_name="edit" 
                size={20} 
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>{user.email}</Text>
        </GlassView>

        {/* Weight Management */}
        <GlassView style={styles.weightManagementCard} glassEffectStyle="regular">
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weight Management</Text>
          
          <View style={styles.weightRow}>
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Current Weight</Text>
              {isEditingWeight ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.weightInput, { color: theme.colors.text, borderBottomColor: colors.primary }]}
                    value={tempWeight}
                    onChangeText={setTempWeight}
                    keyboardType="decimal-pad"
                    placeholder={`${user.currentWeight || 0}`}
                    placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                  />
                  <TouchableOpacity onPress={handleUpdateWeight}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingWeight(false)}>
                    <IconSymbol 
                      ios_icon_name="xmark.circle.fill" 
                      android_material_icon_name="cancel" 
                      size={24} 
                      color={colors.accent}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => {
                    setIsEditingWeight(true);
                    setTempWeight(user.currentWeight?.toString() || '');
                  }}
                  style={styles.weightValueContainer}
                >
                  <Text style={[styles.weightValue, { color: theme.colors.text }]}>{user.currentWeight || 0} kg</Text>
                  <IconSymbol 
                    ios_icon_name="pencil.circle" 
                    android_material_icon_name="edit" 
                    size={20} 
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.weightDivider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Goal Weight</Text>
              {isEditingGoal ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.weightInput, { color: theme.colors.text, borderBottomColor: colors.primary }]}
                    value={tempGoal}
                    onChangeText={setTempGoal}
                    keyboardType="decimal-pad"
                    placeholder={`${user.goalWeight || 0}`}
                    placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                  />
                  <TouchableOpacity onPress={handleUpdateGoal}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={24} 
                      color={colors.success}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingGoal(false)}>
                    <IconSymbol 
                      ios_icon_name="xmark.circle.fill" 
                      android_material_icon_name="cancel" 
                      size={24} 
                      color={colors.accent}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => {
                    setIsEditingGoal(true);
                    setTempGoal(user.goalWeight?.toString() || '');
                  }}
                  style={styles.weightValueContainer}
                >
                  <Text style={[styles.weightValue, { color: theme.colors.text }]}>{user.goalWeight || 0} kg</Text>
                  <IconSymbol 
                    ios_icon_name="pencil.circle" 
                    android_material_icon_name="edit" 
                    size={20} 
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </GlassView>

        {/* Stats */}
        <GlassView style={styles.statsContainer} glassEffectStyle="regular">
          <View style={styles.statBox}>
            <IconSymbol 
              ios_icon_name="list.bullet" 
              android_material_icon_name="list" 
              size={32} 
              color={colors.primary}
            />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{menus.length}</Text>
            <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Total Menus</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <IconSymbol 
              ios_icon_name="fork.knife" 
              android_material_icon_name="restaurant" 
              size={32} 
              color={colors.secondary}
            />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{currentDiet ? '1' : '0'}</Text>
            <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Active Diet</Text>
          </View>
        </GlassView>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>
          {profileOptions.map((option, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity onPress={option.onPress}>
                <GlassView style={styles.optionCard} glassEffectStyle="regular">
                  <View style={[styles.optionIconContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <IconSymbol 
                      ios_icon_name={option.icon} 
                      android_material_icon_name={option.icon as any} 
                      size={24} 
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{option.title}</Text>
                    <Text style={[styles.optionValue, { color: theme.dark ? '#98989D' : '#666' }]}>{option.value}</Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={20} 
                    color={theme.dark ? '#98989D' : '#666'}
                  />
                </GlassView>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <GlassView style={styles.signOutButtonInner} glassEffectStyle="regular">
            <IconSymbol 
              ios_icon_name="arrow.right.square" 
              android_material_icon_name="logout" 
              size={20} 
              color="#FF3B30"
            />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </GlassView>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  notSignedInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  notSignedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  notSignedInText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  profileImageContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.primary,
    position: 'relative',
  },
  profileImageLarge: {
    width: 100,
    height: 100,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  nameEditContainer: {
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 150,
    textAlign: 'center',
  },
  nameEditButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  email: {
    fontSize: 16,
  },
  weightManagementCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weightItem: {
    flex: 1,
    alignItems: 'center',
  },
  weightDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  weightLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  weightValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 14,
  },
  signOutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signOutButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
