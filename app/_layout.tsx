import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

import '../global.css';
import { View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
function LayoutWithInsets() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('black');
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right, flex: 1, backgroundColor: 'black'}}>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <ProductProvider>
          <SafeAreaProvider>
            <LayoutWithInsets />
          </SafeAreaProvider>
        </ProductProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
} 