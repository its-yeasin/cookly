/**
 * Safe destructuring utilities for React components
 * Prevents null/undefined property access errors
 */

import React from "react";
import { ErrorHandler } from "./error-handler";

/**
 * Safe props destructuring for React components
 */
export function safeProps<T extends Record<string, any>>(
  props: T | null | undefined,
  defaultProps: Partial<T> = {}
): T {
  return ErrorHandler.safeDestructure(props, defaultProps);
}

/**
 * Safe state destructuring with validation
 */
export function safeState<T extends Record<string, any>>(
  state: T | null | undefined,
  requiredFields: (keyof T)[] = [],
  defaultState: Partial<T> = {}
): T {
  const safeStateObj = ErrorHandler.safeDestructure(state, defaultState);

  if (requiredFields.length > 0) {
    try {
      ErrorHandler.validateRequired(
        safeStateObj,
        requiredFields,
        "Component state"
      );
    } catch (error) {
      console.warn("State validation warning:", error);
      // Return default state if validation fails
      return { ...defaultState } as T;
    }
  }

  return safeStateObj;
}

/**
 * Safe API response destructuring
 */
export function safeApiResponse<T>(
  response: any,
  expectedShape: Partial<T> = {}
): T {
  try {
    return ErrorHandler.extractResponseData<T>(response);
  } catch (error) {
    console.warn("API response destructuring warning:", error);
    return { ...expectedShape } as T;
  }
}

/**
 * Safe array mapping that handles null/undefined items
 */
export function safeMap<T, R>(
  array: T[] | null | undefined,
  mapFn: (item: T, index: number) => R,
  fallback: R[] = []
): R[] {
  const safeArray = ErrorHandler.safeArray<T>(array, []);

  try {
    return safeArray
      .filter((item): item is T => item !== null && item !== undefined)
      .map((item, index) => {
        try {
          return mapFn(item, index);
        } catch (error) {
          console.warn(`Error mapping item at index ${index}:`, error);
          return null;
        }
      })
      .filter((item): item is R => item !== null);
  } catch (error) {
    console.warn("Error in safeMap:", error);
    return fallback;
  }
}

/**
 * Safe object property access for nested data
 */
export function safeAccess<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  return ErrorHandler.safeGet(obj, path, defaultValue);
}

/**
 * Safe destructuring for navigation params
 */
export function safeParams<T extends Record<string, any>>(
  params: T | null | undefined,
  requiredParams: (keyof T)[] = [],
  defaultParams: Partial<T> = {}
): T {
  const safeParamsObj = ErrorHandler.safeDestructure(params, defaultParams);

  if (requiredParams.length > 0) {
    try {
      ErrorHandler.validateRequired(
        safeParamsObj,
        requiredParams,
        "Navigation params"
      );
    } catch (error) {
      console.warn("Navigation params validation warning:", error);
      return { ...defaultParams } as T;
    }
  }

  return safeParamsObj;
}

/**
 * Safe form data destructuring
 */
export function safeFormData<T extends Record<string, any>>(
  formData: T | null | undefined,
  requiredFields: (keyof T)[] = [],
  defaultValues: Partial<T> = {}
): { data: T; errors: string[] } {
  const safeData = ErrorHandler.safeDestructure(formData, defaultValues);
  const errors: string[] = [];

  // Check for required fields
  for (const field of requiredFields) {
    const value = safeData[field];
    if (value === null || value === undefined || value === "") {
      errors.push(`${String(field)} is required`);
    }
  }

  return { data: safeData, errors };
}

/**
 * Safe async data destructuring for hooks
 */
export function safeAsyncData<T>(
  data: T | null | undefined,
  loading: boolean = false,
  error: Error | null = null,
  defaultData: T | null = null
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isEmpty: boolean;
  hasError: boolean;
} {
  const safeData = data || defaultData;
  const isEmpty = !loading && !error && !safeData;
  const hasError = !!error;

  return {
    data: safeData,
    loading: ErrorHandler.safeBoolean(loading),
    error,
    isEmpty,
    hasError,
  };
}

/**
 * Safe user data destructuring
 */
export function safeUserData(user: any) {
  return ErrorHandler.safeDestructure(user, {
    id: "",
    email: "",
    name: "",
    avatar: null,
    preferences: {},
  });
}

/**
 * Safe recipe data destructuring
 */
export function safeRecipeData(recipe: any) {
  return ErrorHandler.safeDestructure(recipe, {
    id: "",
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    cookingTime: 0,
    servings: 1,
    difficulty: "easy",
    image: "",
    category: "",
    tags: [],
    author: {
      id: "",
      name: "",
      avatar: null,
    },
    rating: 0,
    reviewCount: 0,
  });
}

/**
 * Safe pagination data destructuring
 */
export function safePaginationData(pagination: any) {
  return ErrorHandler.safeDestructure(pagination, {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
}

/**
 * React component props wrapper for safe destructuring
 */
export function withSafeProps<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<P> = {}
) {
  return function SafeComponent(props: P) {
    const safeProps = ErrorHandler.safeDestructure(props, defaultProps);
    return React.createElement(Component, safeProps);
  };
}

/**
 * Higher-order component for error boundary with safe destructuring
 */
export function withSafeDestructuring<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<P> = {},
  requiredProps: (keyof P)[] = []
) {
  return function SafeDestructuringComponent(props: P) {
    try {
      const safeProps = ErrorHandler.safeDestructure(props, defaultProps);

      if (requiredProps.length > 0) {
        ErrorHandler.validateRequired(
          safeProps,
          requiredProps,
          "Component props"
        );
      }

      return React.createElement(Component, safeProps);
    } catch (error) {
      console.error("Safe destructuring error in component:", error);
      // Return a fallback component or error message
      return React.createElement("div", {}, "Component error: Invalid props");
    }
  };
}
