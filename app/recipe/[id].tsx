import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';
import { Recipe } from '@/types';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const recipeData = await apiService.getRecipeById(id!);
      setRecipe(recipeData);
      setIsSaved(user?.savedRecipes.includes(id!) || false);
      
      // Check if user has rated this recipe
      const userRatingData = recipeData.ratings.find(r => r.user === user?._id);
      if (userRatingData) {
        setUserRating(userRatingData.rating);
      }
    } catch (error: any) {
      console.error('Error fetching recipe:', error);
      Alert.alert('Error', 'Failed to load recipe');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveRecipe = async () => {
    if (!recipe) return;

    try {
      if (isSaved) {
        await apiService.unsaveRecipe(recipe._id);
        setIsSaved(false);
        Alert.alert('Success', 'Recipe removed from saved');
      } else {
        await apiService.saveRecipe(recipe._id);
        setIsSaved(true);
        Alert.alert('Success', 'Recipe saved!');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update saved recipes');
    }
  };

  const rateRecipe = async (rating: number) => {
    if (!recipe || isRating) return;

    setIsRating(true);
    try {
      await apiService.rateRecipe(recipe._id, rating);
      setUserRating(rating);
      
      // Refresh recipe to get updated average rating
      await fetchRecipe();
      
      Alert.alert('Success', 'Thank you for rating this recipe!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to rate recipe');
    } finally {
      setIsRating(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <ThemedText>Loading recipe...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!recipe) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loading}>
          <ThemedText>Recipe not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={textColor} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={toggleSaveRecipe}>
            <IconSymbol 
              name="heart.fill" 
              size={24} 
              color={isSaved ? '#FF3B30' : textColor} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <ThemedText type="title" style={styles.title}>
            {recipe.title}
          </ThemedText>
          <ThemedText style={styles.description}>
            {recipe.description}
          </ThemedText>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <IconSymbol name="clock" size={20} color={textColor} />
              <ThemedText style={styles.infoLabel}>Total Time</ThemedText>
              <ThemedText style={styles.infoValue}>{recipe.cookingTime.total} min</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <IconSymbol name="person.fill" size={20} color={textColor} />
              <ThemedText style={styles.infoLabel}>Servings</ThemedText>
              <ThemedText style={styles.infoValue}>{recipe.servings}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <IconSymbol name="star.fill" size={20} color="#FFD700" />
              <ThemedText style={styles.infoLabel}>Rating</ThemedText>
              <ThemedText style={styles.infoValue}>
                {recipe.averageRating?.toFixed(1) || 'N/A'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.timingDetails}>
            <View style={styles.timingItem}>
              <ThemedText style={styles.timingLabel}>Prep: {recipe.cookingTime.prep} min</ThemedText>
            </View>
            <View style={styles.timingItem}>
              <ThemedText style={styles.timingLabel}>Cook: {recipe.cookingTime.cook} min</ThemedText>
            </View>
            <View style={styles.timingItem}>
              <ThemedText style={styles.timingLabel}>Difficulty: {recipe.difficulty}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Ingredients
          </ThemedText>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <ThemedText style={styles.ingredientText}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Instructions
          </ThemedText>
          {recipe.instructions
            .sort((a, b) => a.stepNumber - b.stepNumber)
            .map((instruction) => (
              <View key={instruction.stepNumber} style={styles.instructionItem}>
                <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
                  <ThemedText style={styles.stepNumberText}>
                    {instruction.stepNumber}
                  </ThemedText>
                </View>
                <View style={styles.instructionContent}>
                  <ThemedText style={styles.instructionText}>
                    {instruction.description}
                  </ThemedText>
                  {instruction.duration && (
                    <ThemedText style={styles.instructionDuration}>
                      ⏱ {instruction.duration}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Rate This Recipe
          </ThemedText>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => rateRecipe(star)}
                disabled={isRating}>
                <IconSymbol
                  name="star.fill"
                  size={32}
                  color={star <= userRating ? '#FFD700' : '#E0E0E0'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {userRating > 0 && (
            <ThemedText style={styles.ratingText}>
              You rated this recipe {userRating} star{userRating !== 1 ? 's' : ''}
            </ThemedText>
          )}
        </View>

        {recipe.nutritionalInfo && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Nutrition (per serving)
            </ThemedText>
            <View style={styles.nutritionGrid}>
              {Object.entries(recipe.nutritionalInfo).map(([key, value]) => (
                <View key={key} style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </ThemedText>
                  <ThemedText style={styles.nutritionValue}>
                    {value}{key === 'calories' ? '' : 'g'}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  timingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timingItem: {
    alignItems: 'center',
  },
  timingLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  ingredientItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  instructionDuration: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nutritionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  nutritionLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});