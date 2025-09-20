import { useEffect, useState } from "react";

export interface NetworkState {
  isConnected: boolean;
  isOnline: boolean;
  isLoading: boolean;
}

export function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isOnline: true,
    isLoading: true,
  });

  useEffect(() => {
    // Test network connectivity
    const testConnectivity = async () => {
      try {
        const response = await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          cache: "no-cache",
        });
        const isOnline = response.ok;
        setNetworkState({
          isConnected: isOnline,
          isOnline,
          isLoading: false,
        });
      } catch {
        setNetworkState({
          isConnected: false,
          isOnline: false,
          isLoading: false,
        });
      }
    };

    // Test connectivity on mount
    testConnectivity();

    // Set up periodic connectivity checks
    const interval = setInterval(testConnectivity, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  return networkState;
}

export function useOnlineStatus() {
  const { isOnline } = useNetworkState();
  return isOnline;
}
