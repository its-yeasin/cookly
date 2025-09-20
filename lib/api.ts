import {
  ApiResponse,
  AuthUser,
  GenerateRecipeRequest,
  LoginRequest,
  Recipe,
  RegisterRequest,
  User,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { config } from "./config";
import { AppError, ErrorHandler } from "./error-handler";

// API configuration
const API_BASE_URL = config.API_BASE_URL;
const API_VERSION = "/api";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: config.API_TIMEOUT,
    });

    // Add auth token to requests if available
    this.client.interceptors.request.use(
      async (requestConfig) => {
        const token = await AsyncStorage.getItem(
          config.STORAGE_KEYS.AUTH_TOKEN
        );
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
      },
      (error) => {
        return Promise.reject(ErrorHandler.mapAxiosError(error));
      }
    );

    // Handle unauthorized responses and other errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const mappedError = ErrorHandler.mapAxiosError(error);

        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(config.STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(config.STORAGE_KEYS.USER_DATA);
          // Redirect to login - you might want to use a navigation service here
        }

        // Handle network errors with retry
        if (mappedError.code === "NETWORK_ERROR" && error.config) {
          const maxRetries = 2;
          const retryCount = error.config.__retryCount || 0;

          if (retryCount < maxRetries) {
            error.config.__retryCount = retryCount + 1;
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
            return this.client.request(error.config);
          }
        }

        return Promise.reject(mappedError);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthUser> {
    try {
      // Validate input with safe destructuring
      const safeCredentials = ErrorHandler.safeDestructure(credentials, {
        email: "",
        password: "",
      });

      ErrorHandler.validateRequired(
        safeCredentials,
        ["email", "password"],
        "Login credentials"
      );

      const response: AxiosResponse<ApiResponse<AuthUser>> =
        await this.client.post("/auth/login", safeCredentials);

      // Safe response data extraction
      const authData = ErrorHandler.extractResponseData<AuthUser>(
        response,
        "object"
      );

      // Safe property access for token and user
      const token = ErrorHandler.safeString(authData.token);
      const user = ErrorHandler.safeDestructure(authData.user, {});

      if (!token) {
        throw new AppError(
          "Invalid response: missing authentication token",
          "SERVER_ERROR"
        );
      }

      await AsyncStorage.setItem(config.STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(
        config.STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );

      return authData;
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthUser> {
    try {
      // Validate input with safe destructuring
      const safeUserData = ErrorHandler.safeDestructure(userData, {
        email: "",
        password: "",
        name: "",
      });

      ErrorHandler.validateRequired(
        safeUserData,
        ["email", "password", "name"],
        "Registration data"
      );

      const response: AxiosResponse<ApiResponse<AuthUser>> =
        await this.client.post("/auth/register", safeUserData);

      // Safe response data extraction
      const authData = ErrorHandler.extractResponseData<AuthUser>(
        response,
        "object"
      );

      // Safe property access for token and user
      const token = ErrorHandler.safeString(authData.token);
      const user = ErrorHandler.safeDestructure(authData.user, {});

      if (!token) {
        throw new AppError(
          "Invalid response: missing authentication token",
          "SERVER_ERROR"
        );
      }

      await AsyncStorage.setItem(config.STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(
        config.STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );

      return authData;
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(config.STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(config.STORAGE_KEYS.USER_DATA);
    } catch (error) {
      // Log error but don't throw - logout should always succeed
      console.error("Error during logout:", error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.client.get(
        "/auth/me"
      );

      // Safe response data extraction
      return ErrorHandler.extractResponseData<User>(response, "object");
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      // Safe validation of user data
      const safeUserData = ErrorHandler.safeDestructure(userData, {});

      if (!safeUserData || Object.keys(safeUserData).length === 0) {
        throw new AppError("User data is required", "VALIDATION_ERROR");
      }

      const response: AxiosResponse<ApiResponse<User>> = await this.client.put(
        "/auth/profile",
        safeUserData
      );

      // Safe response data extraction
      const updatedUser = ErrorHandler.extractResponseData<User>(
        response,
        "object"
      );

      await AsyncStorage.setItem(
        config.STORAGE_KEYS.USER_DATA,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  // Recipe methods
  async generateRecipe(request: GenerateRecipeRequest): Promise<Recipe> {
    try {
      // Safe validation of request data
      const safeRequest = ErrorHandler.safeDestructure(request, {
        ingredients: [],
      });

      ErrorHandler.validateRequired(
        safeRequest,
        ["ingredients"],
        "Recipe generation request"
      );

      // Ensure ingredients is an array and not empty
      const ingredients = ErrorHandler.safeArray(safeRequest.ingredients);
      if (ingredients.length === 0) {
        throw new AppError(
          "At least one ingredient is required to generate a recipe",
          "VALIDATION_ERROR"
        );
      }

      const response: AxiosResponse<ApiResponse<Recipe>> =
        await this.client.post("/recipes/generate", {
          ...safeRequest,
          ingredients,
        });

      return ErrorHandler.extractResponseData<Recipe>(response, "object");
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async getRecipes(params?: {
    cuisine?: string;
    mealType?: string;
    isVegetarian?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ recipes: Recipe[]; pagination: any }> {
    try {
      // Safe parameter handling
      const safeParams = ErrorHandler.safeDestructure(params, {});

      const response: AxiosResponse<ApiResponse<Recipe[]>> =
        await this.client.get("/recipes", {
          params: safeParams,
        });

      // Safe extraction of response data
      const responseData = ErrorHandler.extractResponseData<Recipe[]>(response);
      const recipes = ErrorHandler.safeArray<Recipe>(responseData);
      const pagination = ErrorHandler.safeGet(response.data, "pagination", {});

      return {
        recipes,
        pagination,
      };
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async getRecipeById(id: string): Promise<Recipe> {
    try {
      const safeId = ErrorHandler.safeString(id).trim();

      if (!safeId) {
        throw new AppError("Recipe ID is required", "VALIDATION_ERROR");
      }

      const response: AxiosResponse<ApiResponse<Recipe>> =
        await this.client.get(`/recipes/${safeId}`);

      return ErrorHandler.extractResponseData<Recipe>(response, "object");
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async searchRecipesByIngredients(
    ingredients: string[],
    minMatch = 1,
    limit = 10
  ): Promise<Recipe[]> {
    try {
      // Safe array handling
      const safeIngredients = ErrorHandler.safeArray<string>(ingredients);
      const safeMinMatch = ErrorHandler.safeNumber(minMatch, 1);
      const safeLimit = ErrorHandler.safeNumber(limit, 10);

      if (safeIngredients.length === 0) {
        throw new AppError(
          "At least one ingredient is required",
          "VALIDATION_ERROR"
        );
      }

      const response: AxiosResponse<ApiResponse<Recipe[]>> =
        await this.client.post("/recipes/search-by-ingredients", {
          ingredients: safeIngredients,
          minMatch: safeMinMatch,
          limit: safeLimit,
        });

      const responseData = ErrorHandler.extractResponseData<Recipe[]>(response);
      return ErrorHandler.safeArray<Recipe>(responseData);
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async getSavedRecipes(): Promise<Recipe[]> {
    try {
      const response: AxiosResponse<ApiResponse<Recipe[]>> =
        await this.client.get("/recipes/saved");

      const responseData = ErrorHandler.extractResponseData<Recipe[]>(response);
      return ErrorHandler.safeArray<Recipe>(responseData);
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async saveRecipe(recipeId: string): Promise<void> {
    try {
      const safeRecipeId = ErrorHandler.safeString(recipeId).trim();

      if (!safeRecipeId) {
        throw new AppError("Recipe ID is required", "VALIDATION_ERROR");
      }

      await this.client.post(`/recipes/${safeRecipeId}/save`);
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async unsaveRecipe(recipeId: string): Promise<void> {
    try {
      const safeRecipeId = ErrorHandler.safeString(recipeId).trim();

      if (!safeRecipeId) {
        throw new AppError("Recipe ID is required", "VALIDATION_ERROR");
      }

      await this.client.delete(`/recipes/${safeRecipeId}/save`);
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  async rateRecipe(
    recipeId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    try {
      const safeRecipeId = ErrorHandler.safeString(recipeId).trim();
      const safeRating = ErrorHandler.safeNumber(rating);
      const safeComment = ErrorHandler.safeString(comment || "");

      if (!safeRecipeId) {
        throw new AppError("Recipe ID is required", "VALIDATION_ERROR");
      }
      if (safeRating < 1 || safeRating > 5) {
        throw new AppError(
          "Rating must be between 1 and 5",
          "VALIDATION_ERROR"
        );
      }

      await this.client.post(`/recipes/${safeRecipeId}/rate`, {
        rating: safeRating,
        comment: safeComment || undefined,
      });
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get("/health");

      // Safe extraction with fallback values
      const data = ErrorHandler.safeDestructure(response.data, {
        status: "unknown",
        timestamp: new Date().toISOString(),
      });

      return {
        status: ErrorHandler.safeString(data.status, "unknown"),
        timestamp: ErrorHandler.safeString(
          data.timestamp,
          new Date().toISOString()
        ),
      };
    } catch (error) {
      throw ErrorHandler.mapAxiosError(error as any);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
