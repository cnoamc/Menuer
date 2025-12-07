
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import * as ImagePicker from 'expo-image-picker';
import { logProfile, logNavigation } from '@/utils/activityLogger';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateUserProfile } = useAuth();
  const { menus, currentDiet } = useMenu();
  const [isEditingWeight, setIsEditingWeight] = React.useState(false);
  const [tempWeight, setTempWeight] = React.useState('');
  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [tempGoal, setTempGoal] = React.useState('');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState('');

  React.useEffect(() => {
    logNavigation('SCREEN_VIEW', 'User viewed Profile screen', { userId: user?.id }, user?.id, user?.name);
  }, []);

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
    
    const oldWeight = user?.currentWeight;
    await logProfile('WEIGHT_UPDATE', `User updating weight from ${oldWeight}kg to ${weight}kg`, { oldWeight, newWeight: weight }, user?.id, user?.name);
    
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
    
    const oldGoal = user?.goalWeight;
    await logProfile('GOAL_WEIGHT_UPDATE', `User updating goal weight from ${oldGoal}kg to ${goal}kg`, { oldGoal, newGoal: goal }, user?.id, user?.name);
    
    await updateUserProfile({ goalWeight: goal });
    setIsEditingGoal(false);
    setTempGoal('');
  };

  const handleUpdateName = async () => {
    if (!tempName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid name');
      return;
    }
    
    const oldName = user?.name;
    await logProfile('NAME_UPDATE', `User updating name from "${oldName}" to "${tempName.trim()}"`, { oldName, newName: tempName.trim() }, user?.id, user?.name);
    
    await updateUserProfile({ name: tempName.trim() });
    setIsEditingName(false);
    setTempName('');
  };

  const handleChangeProfilePicture = () => {
    logProfile('PROFILE_PICTURE_CHANGE_INITIATED', 'User initiated profile picture change', {}, user?.id, user?.name);
    
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
          onPress: () => logProfile('PROFILE_PICTURE_CHANGE_CANCELLED', 'User cancelled profile picture change', {}, user?.id, user?.name),
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      await logProfile('CAMERA_PERMISSION_REQUEST', 'Requesting camera permission', {}, user?.id, user?.name);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        await logProfile('CAMERA_PERMISSION_DENIED', 'Camera permission denied by user', {}, user?.id, user?.name);
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      await logProfile('CAMERA_PERMISSION_GRANTED', 'Camera permission granted', {}, user?.id, user?.name);
      await logProfile('CAMERA_LAUNCHED', 'User launched camera to take photo', {}, user?.id, user?.name);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await logProfile('PROFILE_PICTURE_CAPTURED', 'User captured photo from camera', { imageUri: result.assets[0].uri }, user?.id, user?.name);
        await updateUserProfile({ profileImage: result.assets[0].uri });
        console.log('Profile picture updated from camera');
      } else {
        await logProfile('CAMERA_CANCELLED', 'User cancelled camera without taking photo', {}, user?.id, user?.name);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      await logProfile('CAMERA_ERROR', 'Error occurred while taking photo', { error: String(error) }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      await logProfile('GALLERY_PERMISSION_REQUEST', 'Requesting gallery permission', {}, user?.id, user?.name);
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        await logProfile('GALLERY_PERMISSION_DENIED', 'Gallery permission denied by user', {}, user?.id, user?.name);
        Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
        return;
      }

      await logProfile('GALLERY_PERMISSION_GRANTED', 'Gallery permission granted', {}, user?.id, user?.name);
      await logProfile('GALLERY_OPENED', 'User opened gallery to select photo', {}, user?.id, user?.name);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await logProfile('PROFILE_PICTURE_SELECTED', 'User selected photo from gallery', { imageUri: result.assets[0].uri }, user?.id, user?.name);
        await updateUserProfile({ profileImage: result.assets[0].uri });
        console.log('Profile picture updated from gallery');
      } else {
        await logProfile('GALLERY_CANCELLED', 'User cancelled gallery without selecting photo', {}, user?.id, user?.name);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      await logProfile('GALLERY_ERROR', 'Error occurred while picking image', { error: String(error) }, user?.id, user?.name);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notSignedInContainer}>
          <IconSymbol 
            ios_icon_name="person.circle" 
            android_material_icon_name="account_circle" 
            size={80} 
            color={colors.textSecondary}
          />
          <Text style={styles.notSignedInTitle}>Not Signed In</Text>
          <Text style={styles.notSignedInText}>
            Sign in to save your menus and track your progress
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              logNavigation('NAVIGATION', 'User navigating to Sign In from Profile', { from: 'profile', to: 'signin' });
              router.push('/auth/signin');
            }}
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
      onPress: () => {
        logNavigation('NAVIGATION', 'User navigating to Diet Selection from Profile', { from: 'profile', to: 'diet-select' }, user?.id, user?.name);
        router.push('/diet/select');
      },
    },
    {
      icon: 'history',
      title: 'Menu History',
      value: `${menus.length} menus`,
      onPress: () => {
        logNavigation('NAVIGATION', 'User navigating to Menu History from Profile', { from: 'profile', to: 'menu-history', menuCount: menus.length }, user?.id, user?.name);
        router.push('/menus/history');
      },
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.header}>
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
              style={styles.nameInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder={user.name}
              placeholderTextColor={colors.textSecondary}
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
              <TouchableOpacity 
                onPress={() => {
                  logProfile('NAME_EDIT_CANCELLED', 'User cancelled name edit', {}, user?.id, user?.name);
                  setIsEditingName(false);
                }} 
                style={styles.iconButton}
              >
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
              logProfile('NAME_EDIT_STARTED', 'User started editing name', {}, user?.id, user?.name);
              setIsEditingName(true);
              setTempName(user.name);
            }}
            style={styles.nameContainer}
          >
            <Text style={styles.name}>{user.name}</Text>
            <IconSymbol 
              ios_icon_name="pencil.circle" 
              android_material_icon_name="edit" 
              size={20} 
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
        
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Weight Management Card */}
      <View style={styles.weightManagementCard}>
        <Text style={styles.cardTitle}>Weight Management</Text>
        
        <View style={styles.weightRow}>
          <View style={styles.weightItem}>
            <Text style={styles.weightLabel}>Current Weight</Text>
            {isEditingWeight ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.weightInput}
                  value={tempWeight}
                  onChangeText={setTempWeight}
                  keyboardType="decimal-pad"
                  placeholder={`${user.currentWeight || 0}`}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={handleUpdateWeight} style={styles.saveButton}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={24} 
                    color={colors.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    logProfile('WEIGHT_EDIT_CANCELLED', 'User cancelled weight edit', {}, user?.id, user?.name);
                    setIsEditingWeight(false);
                  }} 
                  style={styles.cancelButton}
                >
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
                  logProfile('WEIGHT_EDIT_STARTED', 'User started editing current weight', { currentWeight: user.currentWeight }, user?.id, user?.name);
                  setIsEditingWeight(true);
                  setTempWeight(user.currentWeight?.toString() || '');
                }}
                style={styles.weightValueContainer}
              >
                <Text style={styles.weightValue}>{user.currentWeight || 0} kg</Text>
                <IconSymbol 
                  ios_icon_name="pencil.circle" 
                  android_material_icon_name="edit" 
                  size={20} 
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.weightDivider} />

          <View style={styles.weightItem}>
            <Text style={styles.weightLabel}>Goal Weight</Text>
            {isEditingGoal ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.weightInput}
                  value={tempGoal}
                  onChangeText={setTempGoal}
                  keyboardType="decimal-pad"
                  placeholder={`${user.goalWeight || 0}`}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={handleUpdateGoal} style={styles.saveButton}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={24} 
                    color={colors.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    logProfile('GOAL_EDIT_CANCELLED', 'User cancelled goal weight edit', {}, user?.id, user?.name);
                    setIsEditingGoal(false);
                  }} 
                  style={styles.cancelButton}
                >
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
                  logProfile('GOAL_EDIT_STARTED', 'User started editing goal weight', { goalWeight: user.goalWeight }, user?.id, user?.name);
                  setIsEditingGoal(true);
                  setTempGoal(user.goalWeight?.toString() || '');
                }}
                style={styles.weightValueContainer}
              >
                <Text style={styles.weightValue}>{user.goalWeight || 0} kg</Text>
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
      </View>

      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <IconSymbol 
            ios_icon_name="list.bullet" 
            android_material_icon_name="list" 
            size={32} 
            color={colors.primary}
          />
          <Text style={styles.statNumber}>{menus.length}</Text>
          <Text style={styles.statLabel}>Total Menus</Text>
        </View>
        <View style={styles.statBox}>
          <IconSymbol 
            ios_icon_name="fork.knife" 
            android_material_icon_name="restaurant" 
            size={32} 
            color={colors.secondary}
          />
          <Text style={styles.statNumber}>{currentDiet ? '1' : '0'}</Text>
          <Text style={styles.statLabel}>Active Diet</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {profileOptions.map((option, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity 
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={styles.optionIconContainer}>
                <IconSymbol 
                  ios_icon_name={option.icon} 
                  android_material_icon_name={option.icon as any} 
                  size={24} 
                  color={colors.primary}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionValue}>{option.value}</Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <IconSymbol 
          ios_icon_name="arrow.right.square" 
          android_material_icon_name="logout" 
          size={20} 
          color={colors.accent}
        />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
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
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  notSignedInText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
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
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  nameEditContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
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
    color: colors.textSecondary,
  },
  weightManagementCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
    backgroundColor: colors.highlight,
    marginHorizontal: 16,
  },
  weightLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.text,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  saveButton: {
    padding: 4,
  },
  cancelButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
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
    color: colors.text,
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 8,
  },
});
