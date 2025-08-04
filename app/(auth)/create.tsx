import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../lib/productService';


interface Product {
  id: number;
  name: string;
  imageURL: string | null;
}

export default function CreatePage() {
  const { products } = useProduct();
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<'front' | 'back' | 'baby' | 'kid' | 'personalized'>('front');
  const [personalization, setPersonalization] = useState({
    gender: '',
    age: '',
    skinTone: '',
    bodyType: ''
  });

  const handleGenerate = async () => {
    if (!selectedProduct || !user) return;

    if (user.credits < 50) {
      alert('No tienes suficientes créditos para generar imágenes');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      let result;
      
      switch (generationType) {
        case 'front':
          result = await productService.generateAd(selectedProduct.id, true);
          setGeneratedImage(result.adImageUrl || null);
          break;
        case 'back':
          result = await productService.generateBackImage(selectedProduct.id);
          setGeneratedImage(result.backImageUrl || null);
          break;
        case 'baby':
          result = await productService.generateBabyImage(selectedProduct.id);
          setGeneratedImage(result.babyImageUrl || null);
          break;
        case 'kid':
          result = await productService.generateKidImage(selectedProduct.id);
          setGeneratedImage(result.kidImageUrl || null);
          break;
        case 'personalized':
          result = await productService.personalizeImage(selectedProduct.id, personalization);
          setGeneratedImage(result.personalizedImageUrl || null);
          break;
      }
    } catch (error: any) {
      alert(error.message || 'Error al generar la imagen');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      // For mobile, we'll show a success message
      alert('Imagen generada exitosamente');
    } catch (error) {
      alert('Error al descargar la imagen');
    }
  };

  return (
    <View className="flex-1 bg-black text-white">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Generar Imagen</Text>
          <Pressable onPress={() => router.push('/(auth)/add-product')}>
            <Ionicons name="add" size={24} color="#0ea5e9" />
          </Pressable>
        </View>

        {/* Product Selection */}
        {!selectedProduct ? (
          <View className="bg-gray-800 rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-white mb-4">Selecciona un Producto</Text>
            
            {products.length === 0 ? (
              <View className="items-center gap-4 py-8">
                <Ionicons name="shirt-outline" size={64} color="#666" />
                <Text className="text-gray-400 text-center">No tienes productos</Text>
                <Pressable onPress={() => router.push('/(auth)/add-product')}>
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
              <View className="gap-3">
                {products.map((product) => (
                  <Pressable 
                    key={product.id}
                    onPress={() => setSelectedProduct(product)}
                  >
                    {({ pressed }) => (
                      <View 
                        className={`bg-gray-700 rounded-xl p-4 flex-row items-center gap-4 ${pressed ? 'opacity-80' : ''}`}
                        style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                      >
                        {product.imageURL ? (
                          <Image
                            source={{ uri: product.imageURL }}
                            className="w-16 h-16 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-16 h-16 bg-gray-600 rounded-lg items-center justify-center">
                            <Ionicons name="image-outline" size={24} color="#999" />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-white font-medium">{product.name}</Text>
                          <Text className="text-gray-400 text-sm">Toca para seleccionar</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* Generation Options */
          <View className="gap-6">
            {/* Selected Product */}
            <View className="bg-gray-800 rounded-2xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-white">Producto Seleccionado</Text>
                <Pressable onPress={() => setSelectedProduct(null)}>
                  <Ionicons name="close" size={20} color="#666" />
                </Pressable>
              </View>
              
              <View className="flex-row items-center gap-4">
                {selectedProduct.imageURL ? (
                  <Image
                    source={{ uri: selectedProduct.imageURL }}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-20 h-20 bg-gray-600 rounded-xl items-center justify-center">
                    <Ionicons name="image-outline" size={32} color="#999" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-white font-medium text-lg">{selectedProduct.name}</Text>
                  <Text className="text-gray-400">Listo para generar</Text>
                </View>
              </View>
            </View>

            {/* Generation Type Selection */}
            <View className="bg-gray-800 rounded-2xl p-6">
              <Text className="text-lg font-bold text-white mb-4">Tipo de Generación</Text>
              
              <View className="gap-3">
                {[
                  { type: 'front', label: 'Vista Frontal', icon: '👤', emoji: '🧑' },
                  { type: 'back', label: 'Vista Trasera', icon: '👤', emoji: '🧑' },
                  { type: 'baby', label: 'Bebé', icon: '👶', emoji: '👶' },
                  { type: 'kid', label: 'Niño', icon: '🧒', emoji: '🧒' },
                  { type: 'personalized', label: 'Personalizado', icon: '✨', emoji: '✨' },
                ].map((option) => (
                  <Pressable 
                    key={option.type}
                    onPress={() => setGenerationType(option.type as any)}
                  >
                    {({ pressed }) => (
                      <View 
                        className={`flex-row items-center gap-4 p-4 rounded-xl border-2 ${
                          generationType === option.type 
                            ? 'bg-sky-500/20 border-sky-500' 
                            : 'bg-gray-700 border-gray-600'
                        } ${pressed ? 'opacity-80' : ''}`}
                        style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                      >
                        <Text className="text-2xl">{option.emoji}</Text>
                        <View className="flex-1">
                          <Text className="text-white font-medium">{option.label}</Text>
                          <Text className="text-gray-400 text-sm">
                            {option.type === 'personalized' ? 'Personaliza el modelo' : 'Generación estándar'}
                          </Text>
                        </View>
                        {generationType === option.type && (
                          <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
                        )}
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Personalization Options */}
            {generationType === 'personalized' && (
              <View className="bg-gray-800 rounded-2xl p-6">
                <Text className="text-lg font-bold text-white mb-4">Personalización</Text>
                
                <View className="gap-4">
                  {/* Gender */}
                  <View>
                    <Text className="text-gray-400 text-sm mb-2">Género</Text>
                    <View className="flex-row gap-2">
                      {[
                        { value: 'male', label: 'Masculino', emoji: '👨' },
                        { value: 'female', label: 'Femenino', emoji: '👩' },
                      ].map((option) => (
                        <Pressable 
                          key={option.value}
                          onPress={() => setPersonalization(prev => ({ ...prev, gender: option.value }))}
                        >
                          {({ pressed }) => (
                            <View 
                              className={`flex-1 items-center py-3 rounded-lg border-2 ${
                                personalization.gender === option.value 
                                  ? 'bg-sky-500/20 border-sky-500' 
                                  : 'bg-gray-700 border-gray-600'
                              } ${pressed ? 'opacity-80' : ''}`}
                            >
                              <Text className="text-2xl mb-1">{option.emoji}</Text>
                              <Text className="text-white text-sm">{option.label}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Age */}
                  <View>
                    <Text className="text-gray-400 text-sm mb-2">Edad</Text>
                    <View className="flex-row gap-2">
                      {[
                        { value: 'youth', label: 'Joven', emoji: '🧑' },
                        { value: 'adult', label: 'Adulto', emoji: '🧔' },
                        { value: 'senior', label: 'Mayor', emoji: '👴' },
                      ].map((option) => (
                        <Pressable 
                          key={option.value}
                          onPress={() => setPersonalization(prev => ({ ...prev, age: option.value }))}
                        >
                          {({ pressed }) => (
                            <View 
                              className={`flex-1 items-center py-3 rounded-lg border-2 ${
                                personalization.age === option.value 
                                  ? 'bg-sky-500/20 border-sky-500' 
                                  : 'bg-gray-700 border-gray-600'
                              } ${pressed ? 'opacity-80' : ''}`}
                            >
                              <Text className="text-2xl mb-1">{option.emoji}</Text>
                              <Text className="text-white text-sm">{option.label}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Generate Button */}
            <Pressable 
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              {({ pressed }) => (
                <View 
                  className={`w-full items-center justify-center rounded-full bg-sky-500 p-4 ${pressed ? 'opacity-80' : ''} ${isGenerating ? 'opacity-50' : ''}`}
                  style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                >
                  {isGenerating ? (
                    <View className="flex-row items-center gap-3">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-lg font-bold text-white">Generando...</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl">✨</Text>
                      <Text className="text-lg font-bold text-white">Generar Imagen</Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>

            {/* Generated Image */}
            {generatedImage && (
              <View className="bg-gray-800 rounded-2xl p-6">
                <Text className="text-lg font-bold text-white mb-4">Imagen Generada</Text>
                <Image
                  source={{ uri: generatedImage }}
                  className="w-full h-64 rounded-xl"
                  resizeMode="cover"
                />
                <View className="flex-row gap-3 mt-4">
                  <Pressable className="flex-1" onPress={handleDownload}>
                    {({ pressed }) => (
                      <View 
                        className={`bg-sky-500 rounded-lg p-3 items-center ${pressed ? 'opacity-80' : ''}`}
                      >
                        <Text className="text-white font-medium">Descargar</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable className="flex-1">
                    {({ pressed }) => (
                      <View 
                        className={`bg-gray-700 rounded-lg p-3 items-center ${pressed ? 'opacity-80' : ''}`}
                      >
                        <Text className="text-white font-medium">Compartir</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
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
          </View>
        </View>

      </ScrollView>
    </View>
  );
} 