import { AxiosError } from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";

export class AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  RATE_LIMIT = "RATE_LIMIT",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

export class NetworkError extends Error {
  constructor(message = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Validation failed", public details?: any) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ServerError extends Error {
  constructor(message = "Server error occurred", public statusCode?: number) {
    super(message);
    this.name = "ServerError";
  }
}

export class ErrorHandler {
  /**
   * Safe destructuring helper that prevents null/undefined errors
   */
  static safeDestructure<T extends Record<string, any>>(
    obj: T | null | undefined,
    defaultValues: Partial<T> = {}
  ): T {
    if (!obj || typeof obj !== "object") {
      return { ...defaultValues } as T;
    }
    return { ...defaultValues, ...obj };
  }

  /**
   * Safe property access with optional chaining fallback
   */
  static safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
    try {
      const keys = path.split(".");
      let current = obj;

      for (const key of keys) {
        if (current == null || typeof current !== "object") {
          return defaultValue;
        }
        current = current[key];
      }

      return current !== undefined ? current : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Validates required properties and throws descriptive errors
   */
  static validateRequired<T extends Record<string, any>>(
    obj: T | null | undefined,
    requiredFields: (keyof T)[],
    objectName = "Object"
  ): asserts obj is T {
    if (!obj || typeof obj !== "object") {
      throw new ValidationError(
        `${objectName} is required but received ${
          obj === null ? "null" : typeof obj
        }`
      );
    }

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = obj[field];
      if (value === null || value === undefined || value === "") {
        missingFields.push(String(field));
      }
    }

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields in ${objectName}: ${missingFields.join(", ")}`
      );
    }
  }

  /**
   * Safe response data extraction with validation
   */
  static extractResponseData<T>(response: any, expectedDataType?: string): T {
    try {
      // Handle null/undefined response
      if (!response) {
        throw new ValidationError("Response is null or undefined");
      }

      // Extract data from various response structures
      let data: any;

      if (response.data && response.data.data) {
        // Axios response with nested data
        data = response.data.data;
      } else if (response.data) {
        // Axios response with direct data
        data = response.data;
      } else {
        // Direct data
        data = response;
      }

      // Validate extracted data
      if (data === null || data === undefined) {
        throw new ValidationError("Response data is null or undefined");
      }

      // Optional type validation
      if (expectedDataType && typeof data !== expectedDataType) {
        throw new ValidationError(
          `Expected ${expectedDataType} but received ${typeof data}`
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to extract response data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Safe array extraction with fallback
   */
  static safeArray<T>(value: any, fallback: T[] = []): T[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (value === null || value === undefined) {
      return fallback;
    }
    // Try to convert single items to array
    return [value];
  }

  /**
   * Safe string extraction with fallback
   */
  static safeString(value: any, fallback = ""): string {
    if (typeof value === "string") {
      return value;
    }
    if (value === null || value === undefined) {
      return fallback;
    }
    return String(value);
  }

  /**
   * Safe number extraction with fallback
   */
  static safeNumber(value: any, fallback = 0): number {
    if (typeof value === "number" && !isNaN(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  /**
   * Safe boolean extraction with fallback
   */
  static safeBoolean(value: any, fallback = false): boolean {
    if (typeof value === "boolean") {
      return value;
    }
    if (value === null || value === undefined) {
      return fallback;
    }
    // Handle string boolean values
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    // Handle numeric boolean values
    if (typeof value === "number") {
      return value !== 0;
    }
    return fallback;
  }

  /**
   * Handles destructuring errors specifically
   */
  static handleDestructuringError(error: Error, context?: string): AppError {
    const message = error.message.toLowerCase();

    if (
      message.includes("cannot destructure") ||
      message.includes("cannot read prop") ||
      message.includes("undefined") ||
      message.includes("null")
    ) {
      return new ValidationError(
        `Data structure error${context ? ` in ${context}` : ""}: ${
          error.message
        }. This usually means the server returned unexpected data format.`
      );
    }

    return new AppError(error.message);
  }

  /**
   * Maps axios errors to app-specific error types
   */
  static mapAxiosError(error: AxiosError): AppError {
    if (!error.response) {
      // Network error or request timeout
      if (error.code === "ECONNABORTED") {
        return new AppError("Request timeout. Please try again.");
      }
      return new NetworkError(
        "Network connection failed. Please check your internet connection."
      );
    }

    const { status, data } = error.response;
    const message =
      (data as any)?.message || error.message || "An error occurred";

    switch (status) {
      case 400:
        return new ValidationError(message, (data as any)?.errors);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthenticationError("Access denied");
      case 404:
        return new AppError("Resource not found");
      case 409:
        return new ValidationError(message);
      case 429:
        return new AppError("Too many requests. Please try again later.");
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError("Server error. Please try again later.", status);
      default:
        return new AppError(message);
    }
  }

  /**
   * Determines error type from error instance
   */
  static getErrorType(error: Error): ErrorType {
    if (error instanceof NetworkError) return ErrorType.NETWORK;
    if (error instanceof ValidationError) return ErrorType.VALIDATION;
    if (error instanceof AuthenticationError) return ErrorType.AUTHENTICATION;
    if (error instanceof ServerError) return ErrorType.SERVER;
    if (error.name === "TimeoutError") return ErrorType.TIMEOUT;
    return ErrorType.UNKNOWN;
  }

  /**
   * Shows user-friendly error message
   */
  static showError(error: Error, title = "Error") {
    const userMessage = this.getUserFriendlyMessage(error);
    Alert.alert(title, userMessage);
  }

  /**
   * Shows user-friendly error message with retry option
   */
  static showErrorWithRetry(
    error: Error,
    onRetry: () => void,
    title = "Error"
  ) {
    const userMessage = this.getUserFriendlyMessage(error);
    Alert.alert(title, userMessage, [
      { text: "Cancel", style: "cancel" },
      { text: "Retry", onPress: onRetry },
    ]);
  }

  /**
   * Converts technical errors to user-friendly messages
   */
  static getUserFriendlyMessage(error: Error): string {
    if (error instanceof NetworkError) {
      return "Please check your internet connection and try again.";
    }

    if (error instanceof ValidationError) {
      return error.message || "Please check your input and try again.";
    }

    if (error instanceof AuthenticationError) {
      return "Please log in again to continue.";
    }

    if (error instanceof ServerError) {
      return "Our servers are experiencing issues. Please try again later.";
    }

    // Default fallback
    return error.message || "Something went wrong. Please try again.";
  }

  /**
   * Logs error for debugging (can be extended to send to crash reporting service)
   */
  static logError(error: Error, context?: string) {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      console.error("[ErrorHandler]", errorInfo);
    }

    // In production, you might want to send this to a crash reporting service
    // like Sentry, Crashlytics, etc.
  }

  /**
   * Handles authentication errors by clearing auth state and redirecting
   */
  static handleAuthenticationError() {
    try {
      // Note: This should be called from within the auth context
      // or you might need to pass the logout function as a parameter
      router.replace("/auth/login");
    } catch (navigationError) {
      console.error("Navigation error:", navigationError);
    }
  }

  /**
   * Safe async wrapper that catches and handles errors including destructuring errors
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    onError?: (error: Error) => void,
    showErrorAlert = true,
    context?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      let appError: AppError;

      if (error instanceof Error) {
        // Check if it's a destructuring error
        if (this.isDestructuringError(error)) {
          appError = this.handleDestructuringError(error, context);
        } else {
          appError =
            error instanceof AppError ? error : new AppError(error.message);
        }
      } else {
        appError = new AppError(String(error));
      }

      this.logError(appError, context);

      if (onError) {
        onError(appError);
      } else if (showErrorAlert) {
        this.showError(appError);
      }

      return null;
    }
  }

  /**
   * Checks if an error is related to destructuring/property access
   */
  private static isDestructuringError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes("cannot destructure") ||
      message.includes("cannot read prop") ||
      message.includes("undefined") ||
      message.includes("null") ||
      message.includes("is not a function") ||
      message.includes("is not iterable") ||
      message.includes("cannot access before initialization")
    );
  }

  /**
   * Safe wrapper for operations that might involve destructuring
   */
  static safeDestructureOperation<T>(
    operation: () => T,
    fallback: T,
    context?: string
  ): T {
    try {
      return operation();
    } catch (error) {
      if (error instanceof Error && this.isDestructuringError(error)) {
        console.warn(
          `Destructuring error in ${context || "operation"}:`,
          error.message
        );
        return fallback;
      }
      throw error;
    }
  }

  /**
   * Retry wrapper with exponential backoff
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Don't retry for certain error types
        if (
          lastError instanceof AuthenticationError ||
          lastError instanceof ValidationError
        ) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

/**
 * Hook for handling errors in components with destructuring support
 */
export function useErrorHandler() {
  const handleError = (error: Error, showAlert = true) => {
    ErrorHandler.logError(error);
    if (showAlert) {
      ErrorHandler.showError(error);
    }
  };

  const handleErrorWithRetry = (error: Error, onRetry: () => void) => {
    ErrorHandler.logError(error);
    ErrorHandler.showErrorWithRetry(error, onRetry);
  };

  const safeAsync = async <T>(
    operation: () => Promise<T>,
    onError?: (error: Error) => void,
    context?: string
  ): Promise<T | null> => {
    return ErrorHandler.safeAsync(operation, onError, true, context);
  };

  const safeDestructure = <T extends Record<string, any>>(
    obj: T | null | undefined,
    defaultValues: Partial<T> = {}
  ): T => {
    return ErrorHandler.safeDestructure(obj, defaultValues);
  };

  const safeGet = <T>(
    obj: any,
    path: string,
    defaultValue?: T
  ): T | undefined => {
    return ErrorHandler.safeGet(obj, path, defaultValue);
  };

  const validateRequired = <T extends Record<string, any>>(
    obj: T | null | undefined,
    requiredFields: (keyof T)[],
    objectName = "Object"
  ): asserts obj is T => {
    ErrorHandler.validateRequired(obj, requiredFields, objectName);
  };

  const extractResponseData = <T>(
    response: any,
    expectedDataType?: string
  ): T => {
    return ErrorHandler.extractResponseData<T>(response, expectedDataType);
  };

  const safeDestructureOperation = <T>(
    operation: () => T,
    fallback: T,
    context?: string
  ): T => {
    return ErrorHandler.safeDestructureOperation(operation, fallback, context);
  };

  return {
    handleError,
    handleErrorWithRetry,
    safeAsync,
    safeDestructure,
    safeGet,
    validateRequired,
    extractResponseData,
    safeDestructureOperation,
    // Utility methods
    safeArray: ErrorHandler.safeArray,
    safeString: ErrorHandler.safeString,
    safeNumber: ErrorHandler.safeNumber,
    safeBoolean: ErrorHandler.safeBoolean,
  };
}
