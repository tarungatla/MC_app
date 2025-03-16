import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router'; // Import useRouter
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react'; // Import useState
import 'react-native-reanimated';
import { AuthProvider } from '../app/lib/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Or your preferred storage

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false); // Add a loaded state
  const [isLoggedIn, setIsLoggedIn] = useState(null); // State for login status
  const router = useRouter(); // Initialize the router

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const token = await AsyncStorage.getItem('authToken'); // Example: Check for a token
        setIsLoggedIn(!!token); // Set isLoggedIn based on token presence
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false); // Assume not logged in on error
      } finally {
        setLoaded(true); // Set loaded to true regardless of login check result
      }
    }

    checkLoginStatus();
  }, []); // Run only once on mount

  useEffect(() => {
    if (loaded && fontsLoaded) {
      SplashScreen.hideAsync();

      if (isLoggedIn === true) {
        router.replace('(tabs)'); // Redirect to tabs if logged in
      } else if (isLoggedIn === false) {
        router.replace('login'); // Redirect to login if not logged in
      }
    }
  }, [loaded, fontsLoaded, isLoggedIn, router]);

  if (!loaded || !fontsLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <AuthProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="user" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthProvider>
  );
}