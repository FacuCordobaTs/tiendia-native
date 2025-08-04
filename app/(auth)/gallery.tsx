import { View , Text, Pressable, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '../../context/ProductContext';
import { useEffect } from 'react';

export default function GalleryPage() {
  const { userImages, isLoading, getUserImages } = useProduct();

  useEffect(() => {
    const fetchUserImages = async () => {
      await getUserImages();
    };
    fetchUserImages();
  }, []);

  return (
    <View className="flex-1 bg-black text-white">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Tus Imágenes</Text>
          <Pressable onPress={() => router.push('/(auth)/add-product')}>
            <Ionicons name="add" size={24} color="#0ea5e9" />
          </Pressable>
        </View>

        {/* Products Grid */}
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-400">Cargando productos...</Text>
          </View>
        ) : userImages.length > 0 ? (
          <View>
            <View className="gap-4">
              {userImages.map((image) => (
                <Pressable 
                  key={image.imageId}
                  onPress={() => router.push(`/(auth)/image/${image.  imageId}`)}
                >
                  {({ pressed }) => (
                    <View 
                      className={`bg-gray-800 rounded-xl overflow-hidden ${pressed ? 'opacity-80' : ''}`}
                      style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                    >
                      <View className="flex-row">
                        {image.imageUrl ? (
                          <Image
                            source={{ uri: image.imageUrl }}
                            className="w-24 h-24"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-24 h-24 bg-gray-600 items-center justify-center">
                            <Ionicons name="image-outline" size={32} color="#999" />
                          </View>
                        )}
                        <View className="flex-1 p-4">
                          <Text className="text-white font-medium text-lg mb-1">{image.productName}</Text>
                        </View>
                        <View className="p-4 justify-center">
                          <Ionicons name="chevron-forward" size={20} color="#666" />
                        </View>
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 justify-center items-center py-12">
            <View className="items-center justify-center bg-gray-900/50 border border-dashed border-gray-700 rounded-2xl p-12 w-full">
              <Ionicons name="shirt-outline" size={64} color="#666" />
              <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
                No tienes productos
              </Text>
              <Text className="text-base text-gray-500 mt-2 text-center">
                Agrega productos para generar imágenes profesionales
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
                    <Text className="text-white font-medium">Agregar Primer Producto</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {userImages.length > 0 && (
          <View className="mt-8">
            <Text className="text-lg font-bold text-white mb-4">Acciones Rápidas</Text>
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
            </View>
          </View>
        )}

        {/* Tips */}
        <View className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6 mt-6">
          <Text className="text-lg font-bold text-white mb-3">💡 Consejos para mejores resultados</Text>
          <View className="gap-2">
            <Text className="text-gray-300 text-sm">• Usa buena iluminación en tus fotos</Text>
            <Text className="text-gray-300 text-sm">• Mantén el producto centrado</Text>
            <Text className="text-gray-300 text-sm">• Evita fondos muy complejos</Text>
            <Text className="text-gray-300 text-sm">• Asegúrate de que el producto esté limpio</Text>
            <Text className="text-gray-300 text-sm">• Evita subir una imagen de una persona vistiendo la prenda</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
} 