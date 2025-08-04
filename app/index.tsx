import { View , Text, Pressable, Image, Button } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function WelcomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(auth)/home');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <StatusBar style="light" />
        <Text className="text-white text-lg">Cargando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black text-white p-6">
      <StatusBar style="light" />

      {/* Header */}
      <View className="pt-12 flex-row items-center justify-center gap-2">
        <Image source={require('../assets/logoblanco.png')} className="w-16 h-16 rounded-xl" />
        <Text className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-white">
          tiendia.app
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center gap-8">
        <View className="flex-row gap-4">
          {/* Before */}
          <View className="flex-1 gap-2 items-center">
            <Text className="text-sm font-medium text-gray-400">Tu Foto</Text>
            <Image
              source={require('../assets/placeholder-antes.jpeg')}
              className="w-full h-48 rounded-lg border-2 border-gray-700"
            />
          </View>
          {/* After */}
          <View className="flex-1 gap-2 items-center">
            <Text className="text-sm font-medium text-cyan-400">Con Tiendia ✨</Text>
            <Image
              source={require('../assets/placeholder-despues.png')}
              className="w-full h-48 rounded-lg border-2 border-cyan-500"
            />
          </View>
        </View>

        <View className="items-center gap-2 px-4">
            <Text className="text-3xl font-bold text-white text-center tracking-tighter">
              Transforma tus fotos en imágenes profesionales.
            </Text>
            <Text className="text-base text-gray-400 text-center">
              Sube la foto de tu producto y deja que nuestra IA haga la magia.
            </Text>
        </View>
      </View>
      
      {/* Footer Button */}
      <View className="pb-12">
        <Link href="/login" asChild>
          <Pressable>
            {({ pressed }) => (
              <View 
                className={`w-full items-center justify-center rounded-full bg-white p-4 ${pressed ? 'opacity-80' : ''}`}
                style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
              >
                <Text className="text-lg font-bold text-black">
                  Comenzar
                </Text>
              </View>
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  );
} 