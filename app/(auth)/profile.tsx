import { View , Text , Pressable, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [storeName, setStoreName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
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
          <Text className="text-xl font-bold text-white">Mi Perfil</Text>
          <Pressable onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </Pressable>
        </View>

        {/* Profile Info */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-white">Información Personal</Text>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <Ionicons 
                name={isEditing ? "close" : "create-outline"} 
                size={20} 
                color="#0ea5e9" 
              />
            </Pressable>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-gray-400 text-sm mb-2">Email</Text>
              <Text className="text-white text-base">{user?.email}</Text>
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">Nombre de la Tienda</Text>
              {isEditing ? (
                <TextInput
                  value={storeName}
                  onChangeText={setStoreName}
                  className="bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="Nombre de tu tienda"
                  placeholderTextColor="#888"
                />
              ) : (
                <Text className="text-white text-base">{user?.name || 'No configurado'}</Text>
              )}
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">Teléfono</Text>
              {isEditing ? (
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  className="bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="Tu teléfono"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-white text-base">{user?.phone || 'No configurado'}</Text>
              )}
            </View>

            {isEditing && (
              <Pressable onPress={handleSave}>
                {({ pressed }) => (
                  <View 
                    className={`bg-sky-500 rounded-lg p-3 items-center ${pressed ? 'opacity-80' : ''}`}
                    style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
                  >
                    <Text className="text-white font-medium">Guardar Cambios</Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Stats */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-white mb-4">Estadísticas</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-sky-400">{user?.credits ? Math.floor(user.credits / 50) : 0}</Text>
              <Text className="text-gray-400 text-sm">Imágenes restantes</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-sky-400">0</Text>
              <Text className="text-gray-400 text-sm">Imágenes generadas</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-white mb-4">Configuración</Text>
          
          <Pressable onPress={() => router.push('/(auth)/pricing')}>
            {({ pressed }) => (
              <View 
                className={`flex-row items-center justify-between p-3 rounded-lg ${pressed ? 'bg-gray-700' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="card-outline" size={20} color="#0ea5e9" />
                  <Text className="text-white">Plan y Créditos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/notifications')}>
            {({ pressed }) => (
              <View 
                className={`flex-row items-center justify-between p-3 rounded-lg ${pressed ? 'bg-gray-700' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="notifications-outline" size={20} color="#0ea5e9" />
                  <Text className="text-white">Notificaciones</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/help')}>
            {({ pressed }) => (
              <View 
                className={`flex-row items-center justify-between p-3 rounded-lg ${pressed ? 'bg-gray-700' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="help-circle-outline" size={20} color="#0ea5e9" />
                  <Text className="text-white">Ayuda y Soporte</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            )}
          </Pressable>
        </View>

        {/* About */}
        <View className="bg-gray-800 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-white mb-4">Acerca de</Text>
          <Text className="text-gray-400 text-sm leading-6">
            Tiendia.app es una plataforma que utiliza inteligencia artificial para transformar 
            fotos de productos en imágenes profesionales. Creada para ayudar a emprendedores 
            y tiendas a mejorar la presentación de sus productos.
          </Text>
          <Text className="text-gray-400 text-sm mt-4">
            Versión 1.0.0
          </Text>
        </View>

      </ScrollView>
    </View>
  );
} 