import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { MusicProvider } from "@/providers/MusicProvider";
import { colors } from "@/constants/theme";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { authStep, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === 'invite-gate' ||
      segments[0] === 'login' ||
      segments[0] === 'signup' ||
      segments[0] === 'onboarding';

    if (authStep === 'ready') {
      if (inAuthGroup) {
        router.replace('/(tabs)/(home)');
      }
      setHasNavigated(true);
      void SplashScreen.hideAsync();
      return;
    }

    if (authStep === 'onboarding') {
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
      setHasNavigated(true);
      void SplashScreen.hideAsync();
      return;
    }

    if (!inAuthGroup) {
      router.replace('/invite-gate');
    }
    setHasNavigated(true);
    void SplashScreen.hideAsync();
  }, [authStep, isLoading, segments, router]);

  if (isLoading || !hasNavigated) {
    return null;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="invite-gate" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="artist" options={{ headerShown: false }} />
      <Stack.Screen
        name="station"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="light" />
        <AuthProvider>
          <MusicProvider>
            <RootLayoutNav />
            <AuthGate>{null}</AuthGate>
          </MusicProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
