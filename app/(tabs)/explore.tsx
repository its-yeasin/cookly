import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiService } from "@/lib/api";
import { Recipe } from "@/types";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExploreScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const filters = [
    { key: "all", label: "All" },
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
    { key: "vegetarian", label: "Vegetarian" },
  ];

  const fetchRecipes = useCallback(async () => {
    console.log("fetching.....");
    try {
      setIsLoading(true);
      const params: any = { page: 1, limit: 20 };

      if (selectedFilter && selectedFilter !== "all") {
        if (["breakfast", "lunch", "dinner"].includes(selectedFilter)) {
          params.mealType = selectedFilter;
        } else if (selectedFilter === "vegetarian") {
          params.isVegetarian = true;
        }
      }

      const result = await apiService.getRecipes(params);
      setRecipes(result.recipes);
      setIsSearchMode(false);
    } catch (err) {
      // console.error("Error fetching recipes");
      console.log(err, "-----errr");
      Alert.alert("Error", "Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    fetchRecipes();
  };

  const searchRecipes = async () => {
    console.log("searching.....");
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      fetchRecipes();
      return;
    }

    try {
      setIsLoading(true);
      setIsSearchMode(true);
      const ingredients = searchQuery
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);
      const searchResults = await apiService.searchRecipesByIngredients(
        ingredients,
        1,
        20
      );
      setRecipes(searchResults);
    } catch {
      console.log("Error searching recipes");
      Alert.alert("Error", "Failed to search recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isSearchMode && searchQuery.trim()) {
      await searchRecipes();
    } else {
      await fetchRecipes();
    }
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (!isSearchMode) {
        fetchRecipes();
      }
    }, [fetchRecipes, isSearchMode])
  );

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${item._id}`)}
    >
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
              {item.averageRating?.toFixed(1) || "N/A"}
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <ThemedText style={styles.difficultyText}>
              {item.difficulty}
            </ThemedText>
          </View>
        </View>
        <View style={styles.tags}>
          {item.mealType.map((type, index) => (
            <View key={index} style={styles.tag}>
              <ThemedText style={styles.tagText}>{type}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterItem = ({ item }: { item: (typeof filters)[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.key && { backgroundColor: tintColor },
      ]}
      onPress={() => setSelectedFilter(item.key)}
    >
      <ThemedText
        style={[
          styles.filterButtonText,
          selectedFilter === item.key && { color: "#fff" },
        ]}
      >
        {item.label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="magnifyingglass" size={64} color="#ccc" />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Recipes Found
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Try adjusting your search or filters
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Explore Recipes</ThemedText>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[
                styles.searchInput,
                { color: textColor, borderColor: tintColor },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by ingredients (comma separated)"
              placeholderTextColor="#666"
              onSubmitEditing={searchRecipes}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: tintColor }]}
            onPress={searchRecipes}
          >
            <IconSymbol name="magnifyingglass" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filters}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersList}
        />
      </View>

      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && (
        <View style={styles.loading}>
          <ThemedText>Loading recipes...</ThemedText>
        </View>
      )}
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
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    position: "relative",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 14,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersList: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  recipeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
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
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
  },
  difficultyText: {
    fontSize: 12,
    opacity: 0.8,
    textTransform: "capitalize",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    textTransform: "capitalize",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
  },
});
