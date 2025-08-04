import { View, Text, Pressable, ScrollView, Image, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, logout } = useAuth();
  const { products, isLoading, getProducts } = useProduct();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    
      <SafeAreaView className="flex-1 bg-gray-900">

      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="gap-1">
            <Text className="text-2xl font-bold text-white">Hola, {userName}</Text>
            <Pressable onPress={() => router.push('/(auth)/pricing')} className="flex-row items-center gap-2">
              <Text className="text-base text-sky-400">{user?.credits ? Math.floor(user.credits / 50) : 0} imágenes disponibles</Text>
              <Ionicons name="add-circle" size={20} color="#0ea5e9" />
            </Pressable>
          </View>
          <Pressable onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </Pressable>
        </View>

        {/* Revision Mode Message - Only visible to Google admin */}
        {user?.email === 'review2025@tiendia.app' && (
          <View className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="shield-checkmark" size={20} color="#fbbf24" />
              <Text className="text-yellow-400 font-bold text-lg">Revision Mode</Text>
            </View>
            <Text className="text-yellow-300 text-sm">
              Full access to the app for Google Play Store review
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-white mb-4">Acciones Rápidas</Text>
          <View className="flex-row gap-3">
            <Pressable 
              onPress={() => router.push('/(auth)/add-product')}
              className="flex-1"
            >
              {({ pressed }) => (
                <View 
                  className={`bg-gray-800 rounded-xl p-4 items-center ${pressed ? 'opacity-80' : ''}`}
                  style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                >
                  <Ionicons name="add-circle-outline" size={32} color="#0ea5e9" />
                  <Text className="text-white font-medium mt-2">Agregar Producto</Text>
                </View>
              )}
            </Pressable>
            <Pressable 
              onPress={() => router.push('/(auth)/gallery')}
              className="flex-1"
            >
              {({ pressed }) => (
                <View 
                  className={`bg-gray-800 rounded-xl p-4 items-center ${pressed ? 'opacity-80' : ''}`}
                  style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                >
                  <Ionicons name="images-outline" size={32} color="#0ea5e9" />
                  <Text className="text-white font-medium mt-2">Galería</Text>
                </View>
              )}
            </Pressable>
            <Pressable 
              onPress={() => router.push('/(auth)/pricing')}
              className="flex-1"
            >
              {({ pressed }) => (
                <View 
                  className={`bg-gray-800 rounded-xl p-4 items-center ${pressed ? 'opacity-80' : ''}`}
                  style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                >
                  <Ionicons name="card-outline" size={32} color="#0ea5e9" />
                  <Text className="text-white font-medium mt-2">Comprar Imágenes</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Products Section */}
        <View>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-2xl font-bold text-white">Tus Productos</Text>
            <Pressable onPress={() => router.push('/(auth)/add-product')}>
              <Ionicons name="add" size={24} color="#0ea5e9" />
            </Pressable>
          </View>
          
          {isLoading ? (
            <View className="items-center justify-center bg-gray-900/50 border border-dashed border-gray-700 rounded-2xl p-12">
              <Text className="text-gray-400">Cargando productos...</Text>
            </View>
          ) : products.length === 0 ? (
            <View className="items-center justify-center bg-gray-900/50 border border-dashed border-gray-700 rounded-2xl p-12">
              <Ionicons name="shirt-outline" size={64} color="#666" />
              <Text className="text-lg font-semibold text-gray-400 mt-4 text-center">
                No tienes productos
              </Text>
              <Text className="text-base text-gray-500 mt-1 text-center">
                ¡Agrega tu primer producto para comenzar!
              </Text>
              <Pressable 
                onPress={() => router.push('/(auth)/add-product')}
                className="mt-6"
              >
                {({ pressed }) => (
                  <View 
                    className={`bg-sky-500 rounded-full px-6 py-3 ${pressed ? 'opacity-80' : ''}`}
                    style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                  >
                    <Text className="text-white font-medium">Agregar Producto</Text>
                  </View>
                )}
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              {products.map((product) => (
                <Pressable 
                  key={product.id}
                  onPress={() => router.push(`/(auth)/product/${product.id}`)}
                >
                  {({ pressed }) => (
                    <View 
                    className={`bg-gray-800 rounded-xl p-4 flex-col items-center gap-y-3 border border-gray-700 my-1 ${pressed ? 'opacity-70' : ''}`}
                    style={{
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 5,
                      elevation: 8,
                    }}
                    >
                      {product.imageURL ? (
                        <Image
                          source={{ uri: product.imageURL }}
                          style={ {
                            width: 300,
                            height: 300,
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <View className="w-16 h-16 bg-gray-600 rounded-lg items-center justify-center">
                          <Ionicons name="image-outline" size={24} color="#999" />
                        </View>
                      )}
                      <Text className="text-white font-medium">{product.name}</Text>
                      <View className="flex-row">
                        <Text className="text-gray-400 text-sm">Toca para generar imagen</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
} 