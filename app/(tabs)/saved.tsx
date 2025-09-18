import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService } from '@/lib/api';
import { Recipe } from '@/types';

export default function SavedScreen() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const fetchSavedRecipes = async () => {
    try {
      const recipes = await apiService.getSavedRecipes();
      setSavedRecipes(recipes);
    } catch (error: any) {
      console.error('Error fetching saved recipes:', error);
      Alert.alert('Error', 'Failed to load saved recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedRecipes();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
    }, [])
  );

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${item._id}`)}>
      <View style={styles.recipeContent}>
        <ThemedText type="defaultSemiBold" style={styles.recipeTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <View style={styles.recipeInfo}>
          <View style={styles.infoItem}>
            <IconSymbol name="clock" size={16} color={textColor} />
            <ThemedText style={styles.infoText}>
              {item.cookingTime.total} min
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
            <ThemedText style={styles.infoText}>
              {item.averageRating?.toFixed(1) || 'N/A'}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="heart.fill" size={64} color="#ccc" />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Saved Recipes
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Start exploring and save your favorite recipes!
      </ThemedText>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: tintColor }]}
        onPress={() => router.push('/explore')}>
        <ThemedText style={styles.exploreButtonText}>Explore Recipes</ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <ThemedText>Loading saved recipes...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Saved Recipes</ThemedText>
      </View>
      
      <FlatList
        data={savedRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  recipeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});