import { View , Text, Pressable, ScrollView, Image, ActivityIndicator, Switch, Alert, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useProduct } from '../../../context/ProductContext';
import { useAuth } from '../../../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Opciones de Personalización ---
const genderOptions = [
  { value: 'male', label: 'Masculino', icon: 'man' },
  { value: 'female', label: 'Femenino', icon: 'woman' },
];
const ageOptions = [
  { value: 'youth', label: 'Joven', icon: 'account-tie' },
  { value: 'adult', label: 'Adulto', icon: 'account' },
  { value: 'senior', label: 'Mayor', icon: 'human-white-cane' },
];
const skinToneOptions = [
  { value: 'light', label: 'Claro', color: '#fff' },
  { value: 'medium', label: 'Medio', color: '#f3e0c7' },
  { value: 'dark', label: 'Oscuro', color: '#8d5524' },
];
const bodyTypeOptions = [
  { value: 'slim', label: 'Delgado', icon: 'flash' },
  { value: 'athletic', label: 'Atlético', icon: 'weight-lifter' },
  { value: 'curvy', label: 'Curvy', icon: 'star-four-points' },
];


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

            {/* Header */}
            <View className="absolute top-14 left-0 right-0 z-20 px-4 flex-row justify-between items-center">
                 <Pressable onPress={onGenerateNew} className="flex-row items-center gap-1">
                    <Ionicons name="arrow-back" size={22} color="#a7b3d3" />
                    <Text className="text-[#a7b3d3] text-base font-medium">Volver</Text>
                </Pressable>
                <View className="flex-row gap-4">
                    <Text className="text-white/70 font-bold">ANTES</Text>
                    <Text className="text-sky-400 font-bold">DESPUÉS</Text>
                </View>
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
            <BlurView intensity={30} tint="dark" style={styles.controlsContainer}>
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
        flex: 1, // Use flex to fill the parent's height
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
        paddingBottom: 32,
        flexDirection: 'row',
        gap: 16,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    }
});


// --- Componente Principal de la Página ---
export const unstable_settings = {
  headerShown: false,
};

export default function ProductGenerationPage() {
  const { id } = useLocalSearchParams();
  const { user, setUser, updateUserCredits } = useAuth();
  const { products, deleteProduct } = useProduct();
  const navigation = useNavigation();

  // Estado del componente
  const [product, setProduct] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [personalizing, setPersonalizing] = useState(false);
  const [isFrontView, setIsFrontView] = useState(true);
  const [isAdultView, setIsAdultView] = useState(true);
  const [isKidView, setIsKidView] = useState(false);
  const [isBabyView, setIsBabyView] = useState(false);

  // Estado de personalización
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedSkinTone, setSelectedSkinTone] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);

  // Estado de la vista de comparación
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [lastGenerationType, setLastGenerationType] = useState<any>(null);
  // Añade un nuevo estado para la imagen precargada
  const [preloadedImageUrl, setPreloadedImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  useEffect(() => {
    if (id) {
      const productData = products.find((p) => p.id === Number(id));
      setProduct(productData);
    }
  }, [id, products]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleGenerateClick = async (payloadOverride: any = null) => {
    if ((user?.credits ?? 0) < 50) {
        Alert.alert("Créditos insuficientes", "No tienes suficientes créditos para generar una imagen.", [
            { text: "Cancelar" },
            { text: "Recargar", onPress: () => router.push('/credits') }
        ]);
        return;
    }

    setIsGenerating(true);
    setPreloadedImageUrl(null); // Resetea la imagen precargada anterior
    let endpoint = '';
    let body: any = {};
    let generationType = {};

    const currentPayload = payloadOverride || (lastPayload && Object.keys(lastPayload).length > 0 ? lastPayload : null);

    if (currentPayload) {
        endpoint = `https://api.tiendia.app/api/products/personalize/${product.id}`;
        body = currentPayload;
        generationType = { type: 'personalize', payload: currentPayload };
    } else if (isBabyView) {
        endpoint = `https://api.tiendia.app/api/products/baby-image/${product.id}`;
        generationType = { type: 'baby' };
    } else if (isKidView) {
        endpoint = `https://api.tiendia.app/api/products/kid-image/${product.id}`;
        generationType = { type: 'kid' };
    } else if (!isFrontView && isAdultView) {
        endpoint = `https://api.tiendia.app/api/products/back-image/${product.id}`;
        generationType = { type: 'back' };
    } else {
        endpoint = `https://api.tiendia.app/api/products/generate-ad/${product.id}`;
        generationType = { type: 'default' };
    }
    
    if (payloadOverride) {
        setLastPayload(payloadOverride);
    }

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify(body)
        });
        console.log(res)
        const data = await res.json();
        console.log(data)
        if (res.ok) {
            const imageUrl = data.personalizedImageUrl || data.babyImageUrl || data.kidImageUrl || data.backImageUrl || data.adImageUrl;
            if (imageUrl) {
                // --- Precarga la nueva imagen ---
                await Image.prefetch(imageUrl);
                // Una vez precargada, actualiza los estados para renderizar la vista de comparación
                setOriginalImageUrl(product.imageURL);
                setGeneratedImageUrl(imageUrl);
                setPreloadedImageUrl(imageUrl); // Este estado confirma que la imagen está lista
                setLastGenerationType(generationType);
                if (!payloadOverride) {
                    if (user) updateUserCredits(user.credits - 50);
                }
            } else {
                 Alert.alert("Error", "La respuesta de la API no contenía una URL de imagen.");
            }
        } else {
            Alert.alert("Error", data.message || 'No se pudo generar la imagen.');
        }
    } catch (error) {
        Alert.alert("Error de red", "Ocurrió un error al conectar con el servidor.");
    } finally {
        setIsGenerating(false);
        setPersonalizing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastGenerationType) return;
    const payloadForRegen = lastGenerationType.type === 'personalize' ? lastPayload : null;
    await handleGenerateClick(payloadForRegen);
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

        const fileUri = FileSystem.documentDirectory + `${product.name.replace(/\s/g, '_')}_${new Date().getTime()}.png`;
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

  const onDelete = async () => {
    setIsDeleting(true);
    await deleteProduct(product.id);
    router.back();
  }

  if (!product) {
    return <View className="flex-1 bg-gray-900 items-center justify-center"><ActivityIndicator size="large" color="#38bdf8" /></View>;
  }
  
  // Pantalla de carga bonita mientras isGenerating == true y la imagen aún no está lista
  if (isGenerating && !preloadedImageUrl) {
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

  // Cambia la condición de renderizado para usar preloadedImageUrl
  if (preloadedImageUrl && originalImageUrl) {
    return (
        <TransformationView
            originalImage={originalImageUrl}
            generatedImage={preloadedImageUrl}
            onRegenerate={handleRegenerate}
            onDownload={handleDownload}
            onGenerateNew={() => {
                setGeneratedImageUrl(null);
                setOriginalImageUrl(null);
                setLastGenerationType(null);
                setLastPayload(null);
                setPreloadedImageUrl(null);
            }}
            isGenerating={isGenerating}
            isDownloading={isDownloading}
        />
    );
  }

  if (isDeleting) {
    return <View className="flex-1 bg-gray-900 items-center justify-center"><ActivityIndicator size="large" color="#38bdf8" /></View>;
  }

  if (personalizing) {
    return (
        <View className="flex-1 bg-[#0a1837] p-4 pt-12">
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false}>
            <View className="bg-[#14244a] p-5 rounded-2xl">
                <Pressable onPress={() => setPersonalizing(false)} className="flex-row items-center mb-4">
                    <Ionicons name="arrow-back" size={20} color="#93c5fd" />
                    <Text className="text-blue-300 text-base ml-1">Volver</Text>
                </Pressable>
                <Text className="text-white text-xl font-bold text-center mb-6">Personalizar Modelo</Text>

                <Text className="text-white font-medium mb-2">Género</Text>
                <View className="flex-row justify-between mb-4 gap-2">
                    {genderOptions.map(opt => (
                        <Pressable key={opt.value} onPress={() => setSelectedGender(opt.value)} className={`flex-1 py-3 rounded-lg items-center border-2 ${selectedGender === opt.value ? 'bg-blue-600 border-blue-400' : 'bg-[#1a2a4d] border-[#22335c]'}`}>
                            <Text className={`mt-1 font-medium text-2xl`}>{opt.icon == 'man' ? '👨‍💼' : '👩‍💼'} </Text>
                            <Text className={`mt-1 font-medium ${selectedGender === opt.value ? 'text-white' : 'text-blue-200'}`}>{opt.label}</Text>
                        </Pressable>
                    ))}
                </View>
                
                <Text className="text-white font-medium mb-2">Edad</Text>
                <View className="flex-row justify-between mb-4 gap-2">
                    {ageOptions.map(opt => (
                        <Pressable key={opt.value} onPress={() => setSelectedAge(opt.value)} className={`flex-1 py-3 rounded-lg items-center border-2 ${selectedAge === opt.value ? 'bg-blue-600 border-blue-400' : 'bg-[#1a2a4d] border-[#22335c]'}`}>
                           <MaterialCommunityIcons name={opt.icon as any} size={28} color={selectedAge === opt.value ? 'white' : '#93c5fd'}/>
                           <Text className={`mt-1 font-medium ${selectedAge === opt.value ? 'text-white' : 'text-blue-200'}`}>{opt.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text className="text-white font-medium mb-2">Tono de Piel</Text>
                <View className="flex-row justify-between mb-4 gap-2">
                    {skinToneOptions.map(opt => (
                        <Pressable key={opt.value} onPress={() => setSelectedSkinTone(opt.value)} className={`flex-1 py-3 rounded-lg items-center border-2 ${selectedSkinTone === opt.value ? 'bg-blue-600 border-blue-400' : 'bg-[#1a2a4d] border-[#22335c]'}`}>
                            <View className="w-7 h-7 rounded-full mb-1 border" style={{ backgroundColor: opt.color, borderColor: selectedSkinTone === opt.value ? 'white' : '#22335c' }} />
                            <Text className={`mt-1 font-medium ${selectedSkinTone === opt.value ? 'text-white' : 'text-blue-200'}`}>{opt.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text className="text-white font-medium mb-2">Tipo de Cuerpo</Text>
                <View className="flex-row justify-between mb-4 gap-2">
                     {bodyTypeOptions.map(opt => (
                        <Pressable key={opt.value} onPress={() => setSelectedBodyType(opt.value)} className={`flex-1 py-3 rounded-lg items-center border-2 ${selectedBodyType === opt.value ? 'bg-blue-600 border-blue-400' : 'bg-[#1a2a4d] border-[#22335c]'}`}>
                           <MaterialCommunityIcons name={opt.icon as any} size={28} color={selectedBodyType === opt.value ? 'white' : '#93c5fd'}/>
                           <Text className={`mt-1 font-medium ${selectedBodyType === opt.value ? 'text-white' : 'text-blue-200'}`}>{opt.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable 
                    onPress={() => {
                        const payload: any = {};
                        if (selectedGender) payload.gender = selectedGender;
                        if (selectedAge) payload.age = selectedAge;
                        if (selectedSkinTone) payload.skinTone = selectedSkinTone;
                        if (selectedBodyType) payload.bodyType = selectedBodyType;
                        handleGenerateClick(payload);
                    }}
                    className="w-full mt-4 py-4 rounded-lg bg-blue-500 items-center justify-center"
                    disabled={isGenerating}
                >
                    {isGenerating ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Generar con estas opciones</Text>}
                </Pressable>
            </View>
            </ScrollView>
        </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Pressable onPress={() => router.back()} className="absolute top-12 left-4 z-10 bg-gray-800/70 p-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        
        <View className="mb-4 mt-10">
            <Image
              source={{ uri: product.imageURL }}
              className="w-full h-64 rounded-xl bg-gray-800"
              resizeMode="contain"
            />
        </View>

        <Text className="text-white text-2xl font-bold text-center mb-6">{product.name}</Text>

        <View className="flex-row items-center justify-center space-x-4 mb-6">
            <Text className={`text-sm font-medium ${isFrontView ? 'text-sky-400' : 'text-gray-400'}`}>Frente</Text>
            <Switch
                value={!isFrontView}
                onValueChange={(value) => isAdultView ? setIsFrontView(!value) : setIsFrontView(true)}
                trackColor={{ false: '#374151', true: '#38bdf8' }}
                thumbColor={'#f4f4f5'}
            />
            <Text className={`text-sm font-medium ${!isFrontView ? 'text-sky-400' : 'text-gray-400'}`}>Detrás</Text>
        </View>

        <View className="flex-row items-center justify-center space-x-4 mb-8">
            {[
                { label: 'Bebé', value: 'bebe', emoji: '👶' },
                { label: 'Niño', value: 'nino', emoji: '🧒' },
                { label: 'Adulto', value: 'adulto', emoji: '🧑' },
            ].map(opt => (
                <Pressable
                    key={opt.value}
                    onPress={() => {
                        setIsAdultView(opt.value === 'adulto');
                        setIsKidView(opt.value === 'nino');
                        setIsBabyView(opt.value === 'bebe');
                        if (opt.value !== 'adulto') setIsFrontView(true);
                    }}
                    className={`items-center px-4 py-2 rounded-lg border-2 
                        ${(opt.value === 'bebe' && isBabyView) || (opt.value === 'nino' && isKidView) || (opt.value === 'adulto' && isAdultView)
                            ? 'bg-sky-500 border-sky-400' : 'bg-gray-800 border-gray-600'
                        }`}
                >
                    <Text className="text-3xl">{opt.emoji}</Text>
                    <Text className="text-white font-medium text-sm mt-1">{opt.label}</Text>
                </Pressable>
            ))}
        </View>
        
        <Pressable 
            onPress={() => setPersonalizing(true)}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-row justify-between items-center mb-8"
        >
            <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center mr-3">
                    <Ionicons name="pencil" size={16} color="white" />
                </View>
                <Text className="text-white font-semibold text-base">Personalizar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray-400" />
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/80 border-t border-gray-700 flex-row items-center">
        <Pressable
            onPress={() => handleGenerateClick(null)}
            disabled={isGenerating || !product.imageURL}
            className={`flex-1 h-14 rounded-lg items-center justify-center flex-row bg-sky-500 ${(isGenerating || !product.imageURL) ? 'opacity-50' : ''}`}
        >
            {isGenerating ? (
                <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold ml-2">Generando...</Text>
                </>
            ) : !product.imageURL ? (
                <>
                    <Ionicons name="alert-circle" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Falta Imagen</Text>
                </>
            ) : (
                <>
                    <Text className="text-white text-lg mr-2">✨</Text>
                    <Text className="text-white font-bold">Generar 1 imagen</Text>
                </>
            )}
        </Pressable>
        <Pressable onPress={onDelete} className="w-14 h-14 ml-3 rounded-lg items-center justify-center bg-gray-700">
            <Ionicons name="trash-outline" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}