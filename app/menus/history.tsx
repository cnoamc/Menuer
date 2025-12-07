
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useMenu } from '@/contexts/MenuContext';

export default function MenuHistoryScreen() {
  const router = useRouter();
  const { menus, deleteMenu } = useMenu();

  const handleDeleteMenu = (menuId: string) => {
    Alert.alert(
      'Delete Menu',
      'Are you sure you want to delete this menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMenu(menuId)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Menu History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {menus.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="tray" 
              android_material_icon_name="inbox" 
              size={64} 
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No menus yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Generate your first menu from the dashboard
            </Text>
          </View>
        ) : (
          menus.map((menu, index) => (
            <React.Fragment key={index}>
              <View style={styles.menuCard}>
                <TouchableOpacity 
                  style={styles.menuCardContent}
                  onPress={() => router.push(`/menus/${menu.id}`)}
                >
                  <View style={styles.menuCardHeader}>
                    <View style={styles.menuIconContainer}>
                      <IconSymbol 
                        ios_icon_name="fork.knife" 
                        android_material_icon_name="restaurant" 
                        size={28} 
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.menuCardInfo}>
                      <Text style={styles.menuCardTitle}>{menu.dietType} Menu</Text>
                      <Text style={styles.menuCardDate}>
                        {new Date(menu.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.menuCardStats}>
                    <View style={styles.statItem}>
                      <IconSymbol 
                        ios_icon_name="flame" 
                        android_material_icon_name="local_fire_department" 
                        size={16} 
                        color={colors.accent}
                      />
                      <Text style={styles.statText}>{menu.totalCalories} cal</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconSymbol 
                        ios_icon_name="list.bullet" 
                        android_material_icon_name="restaurant_menu" 
                        size={16} 
                        color={colors.secondary}
                      />
                      <Text style={styles.statText}>{3 + menu.snacks.length} meals</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMenu(menu.id)}
                >
                  <IconSymbol 
                    ios_icon_name="trash" 
                    android_material_icon_name="delete" 
                    size={20} 
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  menuCardContent: {
    flex: 1,
    padding: 16,
  },
  menuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuCardInfo: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuCardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuCardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  deleteButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
