import { Alert } from "react-native";

export interface ErrorConfig {
  enableErrorBoundary: boolean;
  enableErrorLogging: boolean;
  enableCrashReporting: boolean;
  enableNetworkErrorRetry: boolean;
  maxRetryAttempts: number;
  showErrorDetails: boolean;
}

export const errorConfig: ErrorConfig = {
  enableErrorBoundary: true,
  enableErrorLogging: __DEV__ ? true : false,
  enableCrashReporting: !__DEV__,
  enableNetworkErrorRetry: true,
  maxRetryAttempts: 3,
  showErrorDetails: __DEV__,
};

/**
 * Global error handler for uncaught JavaScript errors
 */
export function setupGlobalErrorHandler() {
  if (__DEV__) {
    return; // Let React Native handle errors in development
  }

  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    // Log the error
    console.error("Global error caught:", error);

    // In production, you might want to send this to a crash reporting service
    if (errorConfig.enableCrashReporting) {
      // Send to crash reporting service (e.g., Crashlytics, Sentry)
      // crashReportingService.recordError(error);
    }

    // Show user-friendly message for fatal errors
    if (isFatal) {
      Alert.alert(
        "Unexpected Error",
        "The app encountered an unexpected error and needs to restart.",
        [
          {
            text: "Restart",
            onPress: () => {
              // In a real app, you might want to restart the app
              // RNRestart.Restart();
            },
          },
        ]
      );
    }

    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

/**
 * Setup promise rejection handler
 */
export function setupPromiseRejectionHandler() {
  if (__DEV__) {
    return; // Let React Native handle rejections in development
  }

  // Handle unhandled promise rejections
  const originalHandler = (global as any).onunhandledrejection;

  (global as any).onunhandledrejection = (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection:", event.reason);

    if (errorConfig.enableCrashReporting) {
      // Send to crash reporting service
      // crashReportingService.recordError(new Error(event.reason));
    }

    if (originalHandler) {
      originalHandler(event);
    }
  };
}

/**
 * Initialize error handling
 */
export function initializeErrorHandling() {
  setupGlobalErrorHandler();
  setupPromiseRejectionHandler();
}
