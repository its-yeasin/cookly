/**
 * Example component demonstrating safe destructuring patterns
 * This shows how to prevent null/undefined property access errors
 */

import { apiService } from "@/lib/api";
import { useErrorHandler } from "@/lib/error-handler";
import {
  safeApiResponse,
  safeAsyncData,
  safeMap,
  safePaginationData,
  safeProps,
  safeRecipeData,
  safeUserData,
} from "@/lib/safe-destructuring";
import { Recipe, User } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

interface RecipeListProps {
  user?: User | null;
  initialRecipes?: Recipe[] | null;
  onRecipePress?: (recipe: Recipe) => void;
  cuisine?: string | null;
}

export function SafeRecipeListExample(props: RecipeListProps) {
  // Safe props destructuring with defaults
  const {
    user = null,
    onRecipePress = () => {},
    cuisine = "all",
  } = safeProps(props, {
    user: null,
    onRecipePress: () => {},
    cuisine: "all",
  });

  // Safe state management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<any>({});

  const { safeAsync, handleError } = useErrorHandler();

  // Safe user data destructuring
  const safeUser = safeUserData(user);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await safeAsync(
      async () => {
        const response = await apiService.getRecipes({
          cuisine: cuisine === "all" || !cuisine ? undefined : cuisine,
          page: 1,
          limit: 20,
        });

        // Safe API response destructuring
        return safeApiResponse(response, {
          recipes: [],
          pagination: {},
        });
      },
      (err) => {
        setError(err);
        handleError(err, false); // Don't show alert, we handle it in UI
      },
      "loadRecipes"
    );

    if (result) {
      // Safe extraction of recipes and pagination
      const safeRecipes = safeMap(
        result.recipes,
        (recipe) => safeRecipeData(recipe),
        []
      );

      const safePagination = safePaginationData(result.pagination);

      setRecipes(safeRecipes);
      setPagination(safePagination);
    }

    setLoading(false);
  }, [cuisine, safeAsync, handleError]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRecipePress = (recipe: Recipe | null | undefined) => {
    // Safe recipe handling
    const safeRecipe = safeRecipeData(recipe);

    if (safeRecipe.id) {
      onRecipePress(safeRecipe);
    } else {
      Alert.alert("Error", "Invalid recipe data");
    }
  };

  // Safe async data handling
  const {
    data: asyncRecipes,
    loading: asyncLoading,
    isEmpty,
    hasError,
  } = safeAsyncData(recipes, loading, error, []);

  const renderRecipe = ({ item }: { item: Recipe | null | undefined }) => {
    // Safe item destructuring in render
    const recipe = safeRecipeData(item);

    // Safe property access with fallbacks
    const title = recipe.title || "Untitled Recipe";
    const description = recipe.description || "No description available";
    const cookingTime = recipe.cookingTime || 0;
    const difficulty = recipe.difficulty || "easy";

    return (
      <TouchableOpacity
        onPress={() => handleRecipePress(recipe)}
        style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
        <Text style={{ fontSize: 14, color: "#666", marginVertical: 4 }}>
          {description}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 12, color: "#999" }}>
            {cookingTime > 0 ? `${cookingTime} min` : "Time not specified"}
          </Text>
          <Text
            style={{ fontSize: 12, color: "#999", textTransform: "capitalize" }}
          >
            {difficulty}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Safe error state rendering
  if (hasError && error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Something went wrong
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          {error.message || "Failed to load recipes"}
        </Text>
        <TouchableOpacity
          onPress={loadRecipes}
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safe loading state rendering
  if (asyncLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading recipes...</Text>
      </View>
    );
  }

  // Safe empty state rendering
  if (isEmpty) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          No recipes found
        </Text>
        <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
          {cuisine === "all"
            ? "No recipes available at the moment."
            : `No recipes found for "${cuisine}" cuisine.`}
        </Text>
      </View>
    );
  }

  // Safe pagination info
  const {
    page = 1,
    total = 0,
    totalPages = 0,
  } = safePaginationData(pagination);

  return (
    <View style={{ flex: 1 }}>
      {/* Safe user greeting */}
      {safeUser.name && (
        <Text style={{ padding: 16, fontSize: 16 }}>
          Hello, {safeUser.name}!
        </Text>
      )}

      {/* Safe recipes list */}
      <FlatList
        data={asyncRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => {
          const safeItem = safeRecipeData(item);
          return safeItem.id || Math.random().toString();
        }}
        onRefresh={loadRecipes}
        refreshing={asyncLoading}
        ListFooterComponent={() =>
          totalPages > 1 ? (
            <Text style={{ padding: 16, textAlign: "center", color: "#666" }}>
              Page {page} of {totalPages} ({total} total recipes)
            </Text>
          ) : null
        }
      />
    </View>
  );
}

// Example of safe props validation with higher-order component
export const SafeRecipeList = React.memo(SafeRecipeListExample);

// Example usage in parent component:
/*
function ParentComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  return (
    <SafeRecipeList
      user={user} // Could be null
      initialRecipes={recipes} // Could be null
      category="italian" // Could be null/undefined
      onRecipePress={(recipe) => {
        // Safe recipe handling guaranteed
        console.log('Recipe pressed:', recipe.id);
      }}
    />
  );
}
*/
