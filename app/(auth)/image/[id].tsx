import { View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useProduct } from '../../../context/ProductContext';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// // --- Componente Principal de la Página ---
export const unstable_settings = {
    headerShown: false,
  };

export default function ImagePage() {  
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { id } = useLocalSearchParams();
    const { userImages, setUserImages, deleteImage } = useProduct();
    const image = userImages.find((image) => image.imageId === Number(id));
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);


    const handleDownload = async () => {
        if (!image?.imageUrl) return;
        setIsDownloading(true);
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para guardar la imagen.');
                setIsDownloading(false);
                return;
            }   
    
            const fileUri = FileSystem.documentDirectory + `${image?.productName.replace(/\s/g, '_')}_${new Date().getTime()}.png`;
            const { uri } = await FileSystem.downloadAsync(image?.imageUrl, fileUri);
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('¡Guardada!', 'La imagen ha sido guardada en tu galería.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar la imagen.');
        } finally {
            setIsDownloading(false);
        }
      };
    
      const confirmDeleteImage = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await deleteImage(Number(id));
            setIsDeleting(false);
            router.back();

        } catch (err: any) {
            setError("No se pudo eliminar la imagen.");
        }
    };


  return (
    <View className="flex-1 items-center bg-gray-900 ">
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={{ padding: 8, paddingTop: 32 }}>
          <Pressable onPress={() => router.back()} className="m-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
            <Text className="text-white text-2xl font-bold text-center my-6">{image?.productName}</Text>
            {
                error && (
                    <Text className="text-red-500 text-center">{error}</Text>
                )
            }
            <Image 
            source={{ uri: image?.imageUrl }} 
            className="rounded-xl bg-gray-800" 
            style={ {
                width: 300,
                height: 300,
              }}
              resizeMode="contain"
            />
            {/* Botón Descargar */}
            <Pressable
                onPress={handleDownload}
                disabled={isDownloading}
                style={{ backgroundColor: '#23283E', paddingVertical: 14, borderRadius: 9999, width: '100%', marginTop: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}
            >
                {({ pressed }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: pressed ? 0.7 : 1 }}>
                        <Ionicons name="download" size={22} color="#38bdf8" style={{ marginRight: 6 }} />
                        <Text className="text-white text-base font-semibold tracking-tight">Descargar</Text>
                    </View>
                )}
            </Pressable>
            {/* Botón Eliminar */}
            <Pressable
                onPress={() => confirmDeleteImage()}
                style={{ backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 9999, width: '100%', marginTop: 12, shadowColor: '#ef4444', shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 }}
            >
                {({ pressed }) => (
                    isDeleting ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: pressed ? 0.7 : 1 }}>
                            <Ionicons name="trash" size={22} color="#fff" style={{ marginRight: 6 }} />
                            <Text className="text-white text-base font-semibold tracking-tight">Eliminando...</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: pressed ? 0.7 : 1 }}>
                            <Ionicons name="trash" size={22} color="#fff" style={{ marginRight: 6 }} />
                            <Text className="text-white text-base font-semibold tracking-tight">Eliminar</Text>
                        </View>
                    )
                )}
            </Pressable>
        </ScrollView>
    </View>
  );
}
