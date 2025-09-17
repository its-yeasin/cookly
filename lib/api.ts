import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  Recipe,
  GenerateRecipeRequest,
  User,
} from '@/types';

// API configuration
const API_BASE_URL = 'http://localhost:4500'; // Update this to your backend URL
const API_VERSION = '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add auth token to requests if available
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle unauthorized responses
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          // Redirect to login - you might want to use a navigation service here
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthUser> {
    const response: AxiosResponse<ApiResponse<AuthUser>> = await this.client.post(
      '/auth/login',
      credentials
    );
    
    const { data } = response.data;
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthUser> {
    const response: AxiosResponse<ApiResponse<AuthUser>> = await this.client.post(
      '/auth/register',
      userData
    );
    
    const { data } = response.data;
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    
    return data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.get('/auth/me');
    return response.data.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.put(
      '/auth/profile',
      userData
    );
    
    const updatedUser = response.data.data;
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  // Recipe methods
  async generateRecipe(request: GenerateRecipeRequest): Promise<Recipe> {
    const response: AxiosResponse<ApiResponse<Recipe>> = await this.client.post(
      '/recipes/generate',
      request
    );
    return response.data.data;
  }

  async getRecipes(params?: {
    cuisine?: string;
    mealType?: string;
    isVegetarian?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ recipes: Recipe[]; pagination: any }> {
    const response: AxiosResponse<ApiResponse<Recipe[]>> = await this.client.get('/recipes', {
      params,
    });
    
    return {
      recipes: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const response: AxiosResponse<ApiResponse<Recipe>> = await this.client.get(`/recipes/${id}`);
    return response.data.data;
  }

  async searchRecipesByIngredients(ingredients: string[], minMatch = 1, limit = 10): Promise<Recipe[]> {
    const response: AxiosResponse<ApiResponse<Recipe[]>> = await this.client.post(
      '/recipes/search-by-ingredients',
      {
        ingredients,
        minMatch,
        limit,
      }
    );
    return response.data.data;
  }

  async getSavedRecipes(): Promise<Recipe[]> {
    const response: AxiosResponse<ApiResponse<Recipe[]>> = await this.client.get('/recipes/saved');
    return response.data.data;
  }

  async saveRecipe(recipeId: string): Promise<void> {
    await this.client.post(`/recipes/${recipeId}/save`);
  }

  async unsaveRecipe(recipeId: string): Promise<void> {
    await this.client.delete(`/recipes/${recipeId}/save`);
  }

  async rateRecipe(recipeId: string, rating: number, comment?: string): Promise<void> {
    await this.client.post(`/recipes/${recipeId}/rate`, {
      rating,
      comment,
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;