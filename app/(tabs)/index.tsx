import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';
import { config } from '@/lib/config';
import { Recipe } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [servings, setServings] = useState(user?.preferences.defaultPortions.toString() || config.DEFAULT_SERVINGS.toString());
  const [mealType, setMealType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const difficulties = ['easy', 'medium', 'hard'];

  const addIngredient = () => {
    const ingredient = currentIngredient.trim();
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    setIsGenerating(true);
    try {
      const recipe = await apiService.generateRecipe({
        ingredients,
        servings: parseInt(servings) || config.DEFAULT_SERVINGS,
        mealType: mealType || undefined,
        difficulty: difficulty || undefined,
        dietaryRestrictions: user?.preferences.dietaryRestrictions || [],
      });
      
      setGeneratedRecipe(recipe);
    } catch (error: any) {
      Alert.alert(
        'Generation Failed',
        error.response?.data?.message || 'Failed to generate recipe. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderIngredient = ({ item }: { item: string }) => (
    <View style={styles.ingredientTag}>
      <ThemedText style={styles.ingredientText}>{item}</ThemedText>
      <TouchableOpacity onPress={() => removeIngredient(item)}>
        <IconSymbol name="xmark" size={16} color={textColor} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Welcome to Cookly</ThemedText>
          <ThemedText style={styles.subtitle}>
            Generate amazing recipes from your ingredients
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Ingredients
          </ThemedText>
          
          <View style={styles.addIngredientContainer}>
            <TextInput
              style={[styles.ingredientInput, { color: textColor, borderColor: tintColor }]}
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              placeholder="Add an ingredient"
              placeholderTextColor="#666"
              onSubmitEditing={addIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={addIngredient}>
              <IconSymbol name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {ingredients.length > 0 && (
            <FlatList
              data={ingredients}
              renderItem={renderIngredient}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.ingredientsList}
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recipe Options
          </ThemedText>
          
          <View style={styles.optionRow}>
            <View style={styles.optionItem}>
              <ThemedText style={styles.optionLabel}>Servings</ThemedText>
              <TextInput
                style={[styles.servingsInput, { color: textColor, borderColor: tintColor }]}
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.optionRow}>
            <ThemedText style={styles.optionLabel}>Meal Type</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsContainer}>
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      mealType === type && { backgroundColor: tintColor },
                    ]}
                    onPress={() => setMealType(mealType === type ? '' : type)}>
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        mealType === type && { color: '#fff' },
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.optionRow}>
            <ThemedText style={styles.optionLabel}>Difficulty</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsContainer}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.optionButton,
                      difficulty === diff && { backgroundColor: tintColor },
                    ]}
                    onPress={() => setDifficulty(difficulty === diff ? '' : diff)}>
                    <ThemedText
                      style={[
                        styles.optionButtonText,
                        difficulty === diff && { color: '#fff' },
                      ]}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            { backgroundColor: tintColor },
            isGenerating && styles.disabledButton,
          ]}
          onPress={generateRecipe}
          disabled={isGenerating || ingredients.length === 0}>
          <IconSymbol name="sparkles" size={20} color="#fff" />
          <ThemedText style={styles.generateButtonText}>
            {isGenerating ? 'Generating Recipe...' : 'Generate Recipe'}
          </ThemedText>
        </TouchableOpacity>

        {generatedRecipe && (
          <View style={styles.recipePreview}>
            <ThemedText type="subtitle" style={styles.recipeTitle}>
              {generatedRecipe.title}
            </ThemedText>
            <ThemedText style={styles.recipeDescription}>
              {generatedRecipe.description}
            </ThemedText>
            <TouchableOpacity
              style={[styles.viewRecipeButton, { backgroundColor: tintColor }]}
              onPress={() => router.push(`/recipe/${generatedRecipe._id}`)}>
              <ThemedText style={styles.viewRecipeButtonText}>View Full Recipe</ThemedText>
            </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  addIngredientContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  ingredientInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientsList: {
    marginTop: 8,
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 8,
  },
  ingredientText: {
    fontSize: 14,
  },
  optionRow: {
    marginBottom: 20,
  },
  optionItem: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  servingsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 80,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  recipePreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  recipeTitle: {
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  viewRecipeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewRecipeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
