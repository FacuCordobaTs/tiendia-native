import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView ,
  Platform,
  ScrollView, // 1. Importa ScrollView
} from "react-native";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginOrRegister, checkAuthStatus } = useAuth();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      const parsed = Linking.parse(url);
      if (parsed.queryParams?.token) {
        await AsyncStorage.setItem(
          "authToken",
          parsed.queryParams.token as string
        );
        await checkAuthStatus();
        router.replace("/(auth)/home");
      }
    });
    return () => subscription.remove();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await loginOrRegister(email, password);
      router.replace("/(auth)/home");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await WebBrowser.openAuthSessionAsync(
        "https://api.tiendia.app/api/auth/google?redirect_uri=tiendia://",
        "tiendia://"
      );
      if (result.type === "success") {
        router.replace("/(auth)/home");
      } else if (result.type === "cancel") {
        setError("Inicio de sesión cancelado");
      }
    } catch (err: any) {
      setError("Error al conectar con Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      className="bg-black"
    >
      <StatusBar style="light" />

      {/* El botón de regreso se queda fuera del ScrollView para que esté fijo */}
      <Link href="/" asChild>
        <Pressable className="absolute top-16 left-6 z-10">
          <Ionicons name="arrow-back-circle" size={40} color="white" />
        </Pressable>
      </Link>

      {/* 2. Reemplaza la View principal con un ScrollView */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 32, // p-8 en Tailwind
        }}
        keyboardShouldPersistTaps="handled" // Mejora la interacción con los toques
      >
        {/* El contenido del formulario va aquí dentro */}
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2 mb-8">
            <Text className="text-4xl font-bold text-white tracking-tighter text-center">
              Bienvenido a tiendia
            </Text>
            <Text className="text-gray-400 text-center text-base">
              Transforma tus fotos en imágenes profesionales
            </Text>
          </View>

          {/* Google Login Button */}
          <Pressable onPress={handleGoogleLogin} disabled={isLoading}>
            {({ pressed }) => (
              <View
                className={`w-full flex-row items-center justify-center rounded-full bg-white p-4 ${pressed ? "opacity-80" : ""} ${isLoading ? "opacity-50" : ""}`}
                style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
              >
                <Ionicons name="logo-google" size={24} color="black" style={{ marginRight: 12 }} />
                <Text className="text-lg font-bold text-black">
                  {isLoading ? "Conectando..." : "Continuar con Google"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="mx-4 text-gray-400">o</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          {/* Email Input */}
          <View className="gap-2">
            <Text className="text-white font-medium text-base">Email</Text>
            <TextInput
              placeholder="tu@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(null); }}
              className="bg-gray-800 text-white text-lg rounded-xl p-4 border border-gray-700 focus:border-sky-400"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View className="gap-2">
            <Text className="text-white font-medium text-base">Contraseña</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={password}
              onChangeText={(text) => { setPassword(text); setError(null); }}
              className="bg-gray-800 text-white text-lg rounded-xl p-4 border border-gray-700 focus:border-sky-400"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Pressable onPress={handleSubmit} disabled={isLoading}>
            {({ pressed }) => (
              <View
                className={`w-full items-center justify-center rounded-full bg-sky-500 p-4 ${pressed ? "opacity-80" : ""} ${isLoading ? "opacity-50" : ""}`}
                style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-lg font-bold text-white">Continuar</Text>
                )}
              </View>
            )}
          </Pressable>

          {/* Terms */}
          <Text className="text-xs text-gray-500 text-center mt-4">
            Al continuar, aceptas nuestros{" "}
            <Text className="text-sky-400">Términos y Condiciones</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}