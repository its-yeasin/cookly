import { ErrorHandler } from "@/lib/error-handler";
import React, { Component, ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    ErrorHandler.logError(
      error,
      `React Error Boundary: ${errorInfo.componentStack}`
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Oops! Something went wrong
            </ThemedText>
            <ThemedText style={styles.message}>
              We&apos;re sorry for the inconvenience. Please try again.
            </ThemedText>
            {__DEV__ && this.state.error && (
              <ThemedText style={styles.errorDetails}>
                {this.state.error.message}
              </ThemedText>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  errorDetails: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.5,
    fontFamily: "monospace",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
