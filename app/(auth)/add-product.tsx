import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, StyleSheet, PanResponder, Animated, Dimensions, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useProduct } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../lib/productService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';


// --- Componente de Slider de Comparación ---
const { width: screenWidth } = Dimensions.get('window');
const SLIDER_WIDTH = 50;

const ImageComparisonSlider = ({ beforeImage, afterImage }: { beforeImage: string, afterImage: string }) => {
    const position = useRef(new Animated.Value(screenWidth / 2)).current;
    const valueRef = useRef(screenWidth / 2);
    const [imageRenderedHeight, setImageRenderedHeight] = useState(screenWidth); // Default to a square aspect ratio

    // Effect to calculate the image's rendered height based on its aspect ratio
    useEffect(() => {
        if (beforeImage) {
            Image.getSize(beforeImage, (width, height) => {
                const aspectRatio = height / width;
                setImageRenderedHeight(screenWidth * aspectRatio);
            }, (error) => {
                console.error(`Couldn't get image size: ${error.message}`);
                setImageRenderedHeight(screenWidth); // Fallback to a square
            });
        }
    }, [beforeImage]);

    // Effect for the initial slide-and-return animation, triggered when afterImage changes
    useEffect(() => {
        if (afterImage) {
        position.setValue(0); // Start from the far left
        valueRef.current = 0;

        Animated.sequence([
                Animated.delay(2500), // Wait a moment before starting
            Animated.timing(position, {
                toValue: screenWidth, // Slide to the far right
                duration: 1500,
                useNativeDriver: false, // Required for layout property animation
            }),
            Animated.delay(300),
            Animated.timing(position, {
                toValue: screenWidth / 2, // Return to the center
                duration: 750,
                useNativeDriver: false,
            }),
        ]).start(() => {
            valueRef.current = screenWidth / 2; // Set final resting position
        });
        }
    }, [afterImage]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                position.stopAnimation(); // Stop any ongoing animation
                valueRef.current = (position as any)._value;
            },
            onPanResponderMove: (evt, gestureState) => {
                const newX = valueRef.current + gestureState.dx;
                if (newX >= 0 && newX <= screenWidth) {
                    position.setValue(newX);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                const newX = valueRef.current + gestureState.dx;
                if (newX <= 0) {
                    valueRef.current = 0;
                } else if (newX >= screenWidth) {
                    valueRef.current = screenWidth;
                } else {
                    valueRef.current = newX;
                }
            },
        })
    ).current;
    
    // Dynamic styles based on calculated image height
    const imageStyle = { width: screenWidth, height: imageRenderedHeight };

    return (
        <View style={{ width: screenWidth, height: imageRenderedHeight, justifyContent: 'center', alignItems: 'center' }}>
            <Image
                source={{ uri: beforeImage }}
                style={imageStyle}
                resizeMode="cover"
            />
            <Animated.View style={[StyleSheet.absoluteFill, { 
                height: imageRenderedHeight,
                width: position,
                overflow: 'hidden'
            }]}>
                <Image
                    source={{ uri: afterImage }}
                    style={imageStyle}
                    resizeMode="cover"
                />
            </Animated.View>

            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.sliderHandleContainer,
                    {
                        height: imageRenderedHeight, // Apply dynamic height
                        transform: [{ translateX: position.interpolate({
                            inputRange: [0, screenWidth],
                            outputRange: [-screenWidth / 2, screenWidth / 2],
                            extrapolate: 'clamp'
                        }) }],
                    },
                ]}
            >
                <View style={styles.sliderLine} />
                <View style={styles.sliderHandle}>
                    <Ionicons name="sparkles" size={24} color="#fff" />
                </View>
                <View style={styles.sliderLine} />
            </Animated.View>
        </View>
    );
};


// --- Nueva Vista de Transformación ---
const TransformationView = ({ originalImage, generatedImage, onRegenerate, onDownload, onGenerateNew, isGenerating, isDownloading }: {
  originalImage: string;
  generatedImage: string;
  onRegenerate: () => void;
  onDownload: () => void;
  onGenerateNew: () => void;
  isGenerating: boolean;
  isDownloading: boolean;
}) => {
   return (
      <View className="flex-1">
          <StatusBar style="light" />
          <LinearGradient colors={['#23283E', '#0F101C', '#080910']} style={StyleSheet.absoluteFill} />

          {/* Header with BlurView */}
          <View className="absolute top-14 left-4 right-4 z-20">
              <BlurView intensity={70} tint="dark" className="flex-row justify-between items-center px-4 py-2 rounded-xl overflow-hidden">
                  <Pressable onPress={onGenerateNew} className="flex-row items-center gap-1">
                      <Ionicons name="arrow-back" size={22} color="#a7b3d3" />
                      <Text className="text-[#a7b3d3] text-base font-medium">Volver</Text>
                  </Pressable>
                  <View className="flex-row gap-4">
                      <Text className="text-white/70 font-bold">ANTES</Text>
                      <Text className="text-sky-400 font-bold">DESPUÉS</Text>
                  </View>
              </BlurView>
          </View>

          {/* Image Slider */}
          <View className="flex-1 items-center justify-center">
               {isGenerating ? (
                  <View className="items-center justify-center">
                      <ActivityIndicator size="large" color="#a855f7" />
                      <Text className="text-purple-300 mt-4 text-lg">Regenerando imagen...</Text>
                  </View>
              ) : (
                  <ImageComparisonSlider beforeImage={originalImage} afterImage={generatedImage} />
              )}
          </View>

          {/* Controls */}
          <BlurView intensity={80} tint="dark" style={styles.controlsContainer}>
              <Pressable
                  onPress={onRegenerate}
                  disabled={isGenerating || isDownloading}
                  className={`flex-1 h-14 rounded-full items-center justify-center flex-row bg-white/10 border border-white/20 ${(isGenerating || isDownloading) ? 'opacity-50' : ''}`}
              >
                  <Ionicons name="sparkles-outline" size={22} color="#c084fc" />
                  <Text className="text-purple-300 font-bold ml-2">Regenerar</Text>
              </Pressable>
              <Pressable
                  onPress={onDownload}
                  disabled={isDownloading || isGenerating}
                  className={`flex-1 h-14 rounded-full items-center justify-center flex-row bg-sky-500/90 ${(isDownloading || isGenerating) ? 'opacity-50' : ''}`}
              >
                   {isDownloading ? (
                      <ActivityIndicator color="white"/>
                   ) : (
                      <Ionicons name="download-outline" size={22} color="white" />
                   )}
                  <Text className="text-white font-bold ml-2">Descargar</Text>
              </Pressable>
          </BlurView>
      </View>
  );
};


export default function AddProductPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [preloadedImageUrl, setPreloadedImageUrl] = useState<string | null>(null);

  const { getProducts } = useProduct();
  const { user, updateUserCredits } = useAuth();
  
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Error al seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Se necesita permiso para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setError('Error al tomar la foto');
    }
  };

  const generateProduct = async (isRegenerating = false) => {
    if (!selectedImage || !user) return;
  
    if (user.credits < 50) {
      setError('No tienes suficientes créditos para generar productos');
      return;
    }
  
    setIsLoading(true);
    setError(null);
    if (!isRegenerating) {
        setPreloadedImageUrl(null);
    }
  
    try {
      
      const base64Image = await productService.uploadImage(selectedImage);
      
      const response = await fetch('https://api.tiendia.app/api/products/generate-product-and-image', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          image: base64Image,
          includeModel: true
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar el producto');
      }
  
      const result = await response.json();
      const newGeneratedUrl = result.product.generatedImageUrl;
      
      if (newGeneratedUrl) {
          await Image.prefetch(newGeneratedUrl);
          setOriginalImageUrl(result.product.originalImageUrl);
          setGeneratedImageUrl(newGeneratedUrl);
          setPreloadedImageUrl(newGeneratedUrl);
          if(!isRegenerating) {
              updateUserCredits(user.credits - 50);
          }
          await getProducts();
      } else {
          setError('La respuesta de la API no contenía una URL de imagen.');
      }
  
    } catch (err: any) {
      setError(err.message || 'Error al generar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    setIsDownloading(true);
    try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para guardar la imagen.');
            setIsDownloading(false);
            return;
        }

        const fileUri = FileSystem.documentDirectory + `generated_image_${new Date().getTime()}.png`;
        const { uri } = await FileSystem.downloadAsync(generatedImageUrl, fileUri);
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('¡Guardada!', 'La imagen ha sido guardada en tu galería.');
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo guardar la imagen.');
    } finally {
        setIsDownloading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setGeneratedImageUrl(null);
    setOriginalImageUrl(null);
    setPreloadedImageUrl(null);
    setError(null);
    setIsLoading(false);
  };
  
  if (isLoading && !preloadedImageUrl) {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#23283E', '#0F101C', '#080910']} style={StyleSheet.absoluteFill} />
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-8">
          <View className="items-center mb-8">
            <Ionicons name="sparkles" size={64} color="#a855f7" style={{ textShadowColor: '#38bdf8', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 }} />
            <Text className="text-3xl font-extrabold text-white mt-4 mb-2 text-center" style={{ letterSpacing: -1 }}>Generando tu imagen...</Text>
            <Text className="text-base text-sky-200 text-center opacity-80">Esto puede tardar unos segundos.{"\n"}Estamos aplicando IA para transformar tu producto.</Text>
          </View>
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginBottom: 32 }} />
          <View className="w-full bg-white/10 rounded-2xl p-4 mt-4 border border-white/10">
            <Text className="text-white/80 text-center text-base">No cierres la app ni apagues la pantalla.{"\n"}¡La IA está en proceso! ✨</Text>
          </View>
        </View>
      </View>
    );
  }

  if (preloadedImageUrl && originalImageUrl) {
    return (
        <TransformationView
            originalImage={originalImageUrl}
            generatedImage={preloadedImageUrl}
            onRegenerate={() => generateProduct(true)}
            onDownload={handleDownload}
            onGenerateNew={resetForm}
            isGenerating={isLoading}
            isDownloading={isDownloading}
        />
    );
  }


  return (
    <View className="flex-1 bg-black text-white">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Generar Producto con IA</Text>
          <View style={{ width: 24 }} />
        </View>

          <View className="gap-6">
            {/* Image Selection */}
            <View className="bg-gray-800 rounded-2xl p-6">
              <Text className="text-lg font-bold text-white mb-4">Foto del Producto</Text>
              
              {selectedImage ? (
                <View className="items-center gap-4">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-full h-64 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-row gap-3">
                    <Pressable onPress={takePhoto}>
                      {({ pressed }) => (
                        <View 
                          className={`bg-sky-500 rounded-full px-4 py-2 ${pressed ? 'opacity-80' : ''}`}
                          style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                        >
                          <Text className="text-white font-medium">Cambiar Foto</Text>
                        </View>
                      )}
                    </Pressable>
                    <Pressable onPress={() => setSelectedImage(null)}>
                      {({ pressed }) => (
                        <View 
                          className={`bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 ${pressed ? 'opacity-80' : ''}`}
                          style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                        >
                          <Text className="text-red-400 font-medium">Eliminar</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="items-center gap-4">
                  <View className="w-full h-64 bg-gray-700 rounded-xl border-2 border-dashed border-gray-600 items-center justify-center">
                    <Ionicons name="camera-outline" size={48} color="#666" />
                    <Text className="text-gray-400 mt-2 text-center">Selecciona una imagen</Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Pressable onPress={takePhoto}>
                      {({ pressed }) => (
                        <View 
                          className={`bg-sky-500 rounded-full px-4 py-2 ${pressed ? 'opacity-80' : ''}`}
                          style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                        >
                          <Text className="text-white font-medium">Tomar Foto</Text>
                        </View>
                      )}
                    </Pressable>
                    <Pressable onPress={pickImage}>
                      {({ pressed }) => (
                        <View 
                          className={`bg-gray-700 rounded-full px-4 py-2 ${pressed ? 'opacity-80' : ''}`}
                          style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                        >
                          <Text className="text-white font-medium">Galería</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            )}

            {/* Generate Button */}
            <Pressable 
              onPress={() => generateProduct(false)}
              disabled={isLoading || !selectedImage}
            >
              {({ pressed }) => (
                <View 
                  className={`w-full items-center justify-center rounded-full bg-sky-500 p-4 ${pressed ? 'opacity-80' : ''} ${isLoading || !selectedImage ? 'opacity-50' : ''}`}
                  style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-3">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-lg font-bold text-white">Generando...</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl">✨</Text>
                      <Text className="text-lg font-bold text-white">Generar Producto con IA</Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          </View>
      </ScrollView>
    </View>
  );
} 

const styles = StyleSheet.create({
  comparisonImage: {
      width: '100%',
      height: '100%',
  },
  sliderHandleContainer: {
      position: 'absolute',
      width: SLIDER_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
  },
  sliderLine: {
      width: 3,
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: '#00d4ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
  },
  sliderHandle: {
      position: 'absolute',
      width: SLIDER_WIDTH,
      height: SLIDER_WIDTH,
      borderRadius: SLIDER_WIDTH / 2,
      backgroundColor: 'rgba(0, 212, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.9)',
      shadowColor: '#00d4ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 15,
      elevation: 10,
  },
  controlsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      gap: 16,
      borderTopWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      // ADDED/MODIFIED LINES:
      backgroundColor: 'rgba(15, 16, 28, 0.7)', // Dark, semi-transparent background
      overflow: 'hidden',
  }
});