// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  savedRecipes: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  defaultPortions: number;
}

export interface AuthUser {
  user: User;
  token: string;
}

// Recipe types
export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  inputIngredients: string[];
  instructions: Instruction[];
  cookingTime: CookingTime;
  difficulty: string;
  servings: number;
  cuisine: string;
  mealType: string[];
  dietaryInfo: DietaryInfo;
  nutritionalInfo: NutritionalInfo;
  ratings: Rating[];
  averageRating: number;
  createdBy: string;
  createdAt: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Instruction {
  stepNumber: number;
  description: string;
  duration?: string;
}

export interface CookingTime {
  prep: number;
  cook: number;
  total: number;
}

export interface DietaryInfo {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isKeto?: boolean;
  isPaleo?: boolean;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export interface Rating {
  user: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  preferences?: Partial<UserPreferences>;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  servings?: number;
  mealType?: string;
  difficulty?: string;
  dietaryRestrictions?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecipes: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  'auth/login': undefined;
  'auth/register': undefined;
  'recipe/[id]': { id: string };
  'modal': undefined;
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
  saved: undefined;
  profile: undefined;
};