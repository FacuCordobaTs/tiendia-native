// src/pages/CreditsPage.tsx
import { useState, useEffect, useRef } from 'react';
import { View , Text, Pressable, ScrollView, SafeAreaView, Linking, ActivityIndicator, AppState, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
// Base prices in USD
const BASE_PACKS = [
    { id: 1, images: 1, priceUSD: 0.125, credits: 50 },
    { id: 2, images: 10, priceUSD: 1.25, credits: 500 },
    { id: 3, images: 50, priceUSD: 4.4, credits: 2500, discount: 30 },
    { id: 4, images: 100, priceUSD: 8.8, credits: 5000, discount: 30 }
];

const ARG_PACKS = [
    { id: 1, images: 1, priceUSD: 0.1, price: 120, credits: 50 },
    { id: 2, images: 10, priceUSD: 1, price: 1200, credits: 500 },
    { id: 3, images: 50, priceUSD: 3.5, price: 4200, credits: 2500, discount: 30 },
    { id: 4, images: 100, priceUSD: 7, price: 8400, credits: 5000, discount: 30 }
];

// Exchange rates from USD to other currencies
const EXCHANGE_RATES = [
    { source_currency: "USD", target_currency: "BRL", value: 6.65227 },
    { source_currency: "USD", target_currency: "CLP", value: 1083.95280 },
    { source_currency: "USD", target_currency: "COP", value: 4689.88920 },
    { source_currency: "USD", target_currency: "MXN", value: 21.85355 },
    { source_currency: "USD", target_currency: "PEN", value: 3.96795 },
    { source_currency: "USD", target_currency: "UYU", value: 47.26736 },
    { source_currency: "USD", target_currency: "ARS", value: 1320.47300 },
    { source_currency: "USD", target_currency: "PYG", value: 8281.67550 },
    { source_currency: "USD", target_currency: "BOB", value: 11.53600 },
    { source_currency: "USD", target_currency: "DOP", value: 61.52700 },
    { source_currency: "USD", target_currency: "EUR", value: 1.02940 },
    { source_currency: "USD", target_currency: "GTQ", value: 8.18511 },
    { source_currency: "USD", target_currency: "CRC", value: 536.19994 },
    { source_currency: "USD", target_currency: "MYR", value: 4.64839 },
    { source_currency: "USD", target_currency: "IDR", value: 17419.61070 },
    { source_currency: "USD", target_currency: "KES", value: 137.45974 },
    { source_currency: "USD", target_currency: "NGN", value: 2867.14850 }
];

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: { [key: string]: string } = {
    'AR': 'ARS', // Argentina
    'BR': 'BRL', // Brazil
    'CL': 'CLP', // Chile
    'CO': 'COP', // Colombia
    'MX': 'MXN', // Mexico
    'PE': 'PEN', // Peru
    'UY': 'UYU', // Uruguay
    'PY': 'PYG', // Paraguay
    'BO': 'BOB', // Bolivia
    'DO': 'DOP', // Dominican Republic
    'GT': 'GTQ', // Guatemala
    'CR': 'CRC', // Costa Rica
    'MY': 'MYR', // Malaysia
    'ID': 'IDR', // Indonesia
    'KE': 'KES', // Kenya
    'NG': 'NGN', // Nigeria
    'US': 'USD', // United States
    // Add more countries as needed
};

// Currency symbols and formatting
const CURRENCY_INFO: { [key: string]: { symbol: string, locale: string, flag: string } } = {
    'ARS': { symbol: '$', locale: 'es-AR', flag: '🇦🇷' },
    'BRL': { symbol: 'R$', locale: 'pt-BR', flag: '🇧🇷' },
    'CLP': { symbol: '$', locale: 'es-CL', flag: '🇨🇱' },
    'COP': { symbol: '$', locale: 'es-CO', flag: '🇨🇴' },
    'MXN': { symbol: '$', locale: 'es-MX', flag: '🇲🇽' },
    'PEN': { symbol: 'S/', locale: 'es-PE', flag: '🇵🇪' },
    'UYU': { symbol: '$', locale: 'es-UY', flag: '🇺🇾' },
    'PYG': { symbol: '₲', locale: 'es-PY', flag: '🇵🇾' },
    'BOB': { symbol: 'Bs', locale: 'es-BO', flag: '🇧🇴' },
    'DOP': { symbol: 'RD$', locale: 'es-DO', flag: '🇩🇴' },
    'GTQ': { symbol: 'Q', locale: 'es-GT', flag: '🇬🇹' },
    'CRC': { symbol: '₡', locale: 'es-CR', flag: '🇨🇷' },
    'MYR': { symbol: 'RM', locale: 'ms-MY', flag: '🇲🇾' },
    'IDR': { symbol: 'Rp', locale: 'id-ID', flag: '🇮🇩' },
    'KES': { symbol: 'KSh', locale: 'en-KE', flag: '🇰🇪' },
    'NGN': { symbol: '₦', locale: 'en-NG', flag: '🇳🇬' },
    'USD': { symbol: '$', locale: 'en-US', flag: '🇺🇸' },
    'EUR': { symbol: '€', locale: 'de-DE', flag: '🇪🇺' }
};

const LIMITED_PACK_COUNTRIES = [
    'CO', // Colombia
    'EC', // Ecuador
    'GT', // Guatemala
    'MX', // Mexico
    'PA', // Panama
    'PE', // Peru
    'PY', // Paraguay
    'UY', // Uruguay
];

// Notification registration function
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (!Device.isDevice) {
    Alert.alert('Error', 'Debes usar un dispositivo físico para las Notificaciones Push');
    return;
  }

  // Verificar permisos existentes
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Si no se han otorgado, pedirlos
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Si el usuario no dio permiso, salir
  if (finalStatus !== 'granted') {
    Alert.alert('Error', 'No se pudo obtener el token para las notificaciones push! Por favor, asegúrate de que la app tenga permisos para notificaciones o deberas reiniciar la app cada vez que quieras ver acreditadas tus compras.');
    return;
  }

  // Obtener el projectId de la configuración de la app
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    Alert.alert('Error', 'No se encontró el projectId en la configuración de la app. Asegúrate de haber configurado EAS.');
    return;
  }
  
  // Obtener el token de Expo
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Tu Expo Push Token:', token);
  } catch (e) {
    console.error(e);
  }
  
  // Configuración para Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// --- Componente Principal de la Página ---
export const unstable_settings = {
    headerShown: false,
  };

export default function PricingPage() {
    const { user, refreshUser, updateUserCredits } = useAuth();
    const [selectedPack, setSelectedPack] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [userCurrency, setUserCurrency] = useState<string>('USD');
    const [convertedPacks, setConvertedPacks] = useState<any[]>([]);
    const [notificationLoading, setNotificationLoading] = useState<boolean>(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

    const API_BASE_URL = 'https://api.tiendia.app';
    
    const navigation = useNavigation();

    useEffect(() => {
        detectUserCountry();
        checkNotificationStatus();
    }, []);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
      }, [navigation]);

    useEffect(() => {
        if (userCountry) {
            // Force USD for Google admin user
            const currency = (COUNTRY_CURRENCY_MAP[userCountry] || 'USD');
            setUserCurrency(currency);
            convertPacksToCurrency(currency);
        }

    }, [userCountry]);

    // Refrescar usuario al volver a primer plano
    const appState = useRef(AppState.currentState);
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                refreshUser();
            }
            appState.current = nextAppState;
        });
        return () => {
            subscription.remove();
        };
    }, []);

    const detectUserCountry = async () => {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            const country = data.country;
            // setUserCountry("PE")
            if (user?.email === 'review2025@tiendia.app') {
                setUserCountry('US');
            } else {
                setUserCountry(country);
            }
        } catch (error) {
            console.error('Could not detect country automatically:', error);
            setUserCountry('unknown');
        }
    };

    const convertPacksToCurrency = (currency: string) => {
        const exchangeRate = EXCHANGE_RATES.find(rate => rate.target_currency === currency);
        let packsToUse = BASE_PACKS;
        if (userCountry === 'AR') {
            packsToUse = ARG_PACKS;
        }
        if (!exchangeRate && currency !== 'USD') {
            setConvertedPacks(packsToUse);
            return;
        }
        const rate = exchangeRate ? exchangeRate.value : 1;
        const converted = packsToUse.map(pack => ({
            ...pack,
            price: 'price' in pack ? pack.price : Math.round(pack.priceUSD * rate * 100) / 100,
            originalPriceUSD: pack.priceUSD
        }));
        setConvertedPacks(converted);
    };

    const formatPrice = (price: number, currency: string) => {
        const currencyInfo = CURRENCY_INFO[currency];
        if (!currencyInfo) {
            return `${currency} ${price.toFixed(2)}`;
        }

        if (currency === 'ARS') {
            return `${currencyInfo.symbol}${price.toLocaleString(currencyInfo.locale)}`;
        }

        return `${currencyInfo.symbol}${price.toLocaleString(currencyInfo.locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const getPaymentProviderName = () => {
        return userCountry === 'AR' ? 'Mercado Pago' : 'dLocal';
    };

    const getCurrencyDisplay = () => {
        if (user?.email === 'review2025@tiendia.app') {
            return '🇺🇸 Prices in USD (Revision Mode)';
        }
        const currencyInfo = CURRENCY_INFO[userCurrency];
        return currencyInfo ? `${currencyInfo.flag} Precios en ${userCurrency}` : `Precios en ${userCurrency}`;
    };
    
    const handlePurchase = async () => {
        if (!user?.id) {
            setError("Debes iniciar sesión para comprar créditos.");
            return;
        }

        if (!selectedPack) {
            setError("Por favor selecciona un pack de imágenes.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let response;
            const token = await AsyncStorage.getItem('authToken');

            if (user?.email === 'review2025@tiendia.app') {
                const endpoint = `${API_BASE_URL}/api/credits/admin-add-credits`;
                console.log(token)
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                    credentials: 'include',
                    body: JSON.stringify({ credits: selectedPack.credits }),
                })

                if (!response.ok) { 
                    const errorBody = await response.json();
                    console.log(errorBody)
                    const errorMsg = errorBody.message || `Error cargando creditos automaticos (${response.status})`;
                    console.log(errorMsg)
                    setLoading(false);
                    return;
                }
                const data = await response.json()
                console.log(data)
                updateUserCredits(user.credits + selectedPack.credits)
                setLoading(false);
                return;
            }

            if (userCountry === 'AR') {
                // Mercado Pago flow
                const endpoint = `${API_BASE_URL}/api/payments/create-preference`;

                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                    body: JSON.stringify({ credits: selectedPack.price, userId: user.id, uri: 'tiendia://' }),
                });
                console.log(response)
            } else {
                // dLocal flow
                const endpoint = `${API_BASE_URL}/api/payments/create-dlocal-payment`;

                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                    body: JSON.stringify({ credits: selectedPack.priceUSD, userId: user.id, uri: 'tiendia://' }),
                });
                console.log(response)
            }

            if (!response.ok) { //
                let errorMsg = `Error ${response.status}`;
                try {
                    const errorBody = await response.json();
                    errorMsg = errorBody.message || `Error al crear la preferencia de pago (${response.status})`;
                } catch (_) {
                    errorMsg = `Error al crear la preferencia de pago (${response.status})`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            if (userCountry === 'AR') {
                // Mercado Pago flow
                if (data.preference.init_point) {
                    setLoading(false);
                    await Linking.openURL(data.preference.init_point);
                } else {
                    throw new Error("No se recibió la URL de pago de Mercado Pago.");
                }
            } else {
                // dLocal flow
                if (data.redirect_url) {
                    setLoading(false);
                    await Linking.openURL(data.redirect_url);
                } else {
                    throw new Error("No se recibió la URL de pago de dLocal.");
                }
            }

        } catch (err: any) {
            console.error("Error creating payment preference:", err);
            setError(err.message || "Ocurrió un error inesperado al intentar procesar el pago.");
            setLoading(false);
        }
    };

    const checkNotificationStatus = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationsEnabled(status === 'granted');
        } catch (error) {
            console.error('Error checking notification status:', error);
        }
    };

    const handleEnableNotifications = async () => {
        setNotificationLoading(true);
        try {
            const token = await registerForPushNotificationsAsync();
            
            if (token && user?.id) {
                // Obtenemos el token de autenticación del usuario
                const authToken = await AsyncStorage.getItem('authToken'); 
                
                // Enviamos el push token a nuestro backend
                const response = await fetch('https://api.tiendia.app/api/auth/save-push-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        pushToken: token,
                    }),
                });

                if (response.ok) {
                    setNotificationsEnabled(true);
                    Alert.alert('Éxito', 'Notificaciones activadas correctamente');
                } else {
                    Alert.alert('Error', 'No se pudo guardar el token de notificaciones');
                }
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            Alert.alert('Error', 'Ocurrió un error al activar las notificaciones');
        } finally {
            setNotificationLoading(false);
        }
    };

    const isPackDisabled = (pack: any) => {
      return userCountry && LIMITED_PACK_COUNTRIES.includes(userCountry) && !(pack.id === 3 || pack.id === 4);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar style="light" />
            <Pressable onPress={() => router.back()} className="absolute top-8 left-6 z-10">
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>

            <ScrollView contentContainerStyle={{ paddingBottom: 32, paddingTop: 32 }}>

                {/* Notification Permission Section */}
                {!notificationsEnabled && (
                    <View className="px-4 mb-6 mt-12">
                        <View className="bg-blue-900/30 border border-blue-700 rounded-xl p-6">
                            <View className="flex-row items-start gap-3">
                                <Ionicons name="notifications-outline" size={24} color="#60a5fa" />
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-white mb-2">
                                        ¡Atención!
                                    </Text>
                                    <Text className="text-gray-300 leading-relaxed mb-4">
                                        Para poder notificarte que ya puedes utilizar las imágenes que compras te pedimos por favor que actives las notificaciones en la app
                                    </Text>
                                    <Pressable
                                        onPress={handleEnableNotifications}
                                        disabled={notificationLoading}
                                        className={`bg-blue-600 py-3 px-6 rounded-lg ${notificationLoading ? 'opacity-50' : ''}`}
                                    >
                                        {({ pressed }) => (
                                            <View className={`flex-row items-center justify-center ${pressed ? 'opacity-80' : ''}`}>
                                                {notificationLoading ? (
                                                    <>
                                                        <ActivityIndicator color="white" size="small" className="mr-2" />
                                                        <Text className="text-white font-semibold">Activando...</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ionicons name="notifications" size={18} color="white" className="mr-2" />
                                                        <Text className="text-white font-semibold">Activar Notificaciones</Text>
                                                    </>
                                                )}
                                            </View>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                <View className="py-12 px-4">
                    <Text className="text-4xl font-bold text-center text-white flex items-center justify-center gap-3">
                        <Ionicons name="card-outline" size={36} color="white" />
                        Genera imágenes profesionales
                    </Text>
                    <Text className="text-center text-gray-400 mt-4 text-lg">
                        Selecciona el pack que mejor se adapte a tus necesidades
                    </Text>
                </View>

                {/* Revision Mode Message - Only visible to Google admin */}
                {user?.email === 'review2025@tiendia.app' && (
                    <View className="px-4 mb-6">
                        <View className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons name="shield-checkmark" size={20} color="#fbbf24" />
                                <Text className="text-yellow-400 font-bold text-lg">Revision Mode</Text>
                            </View>
                            <Text className="text-yellow-300 text-sm">
                                Full access to the app for Google Play Store review. Prices shown in USD only.
                            </Text>
                        </View>
                    </View>
                )}

                <View className="px-4 mb-8">
                    <View className="bg-gray-800 rounded-xl p-6">
                        <Text className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
                            <Text>✨</Text> ¿Por qué cobramos por las imágenes?
                        </Text>
                        <Text className="text-gray-300 leading-relaxed">
                            Esta app fue creada por un estudiante de la UTN con el objetivo de que todas las tiendas de ropa puedan tener acceso a imágenes profesionales de sus productos de forma accesible. 🎓
                        </Text>
                        <Text className="text-gray-300 leading-relaxed mt-4">
                            La generación de imágenes tiene un costo asociado, y el monto que solicitamos por las imágenes es lo necesario para mantener la aplicación funcionando y seguir mejorando. 💫
                        </Text>
                        <Text className="text-gray-300 leading-relaxed mt-4">
                            Los pagos se realizan de forma segura a través de nuestros proveedores de pago. Al utilizar Tiendia, no solo obtienes acceso a imágenes profesionales de tus productos a un precio accesible, sino que también contribuyes a mejorar la aplicación para que puedas obtener imágenes aún mejores en el futuro. 🤝
                        </Text>
                        <Text className="text-gray-300 leading-relaxed mt-4">
                            ¡Muchas gracias por tu apoyo! 🙏
                        </Text>
                    </View>
                </View>

                <View className="p-4 items-center justify-center">
                    <View className="w-full max-w-4xl bg-gray-800 rounded-2xl">
                        <View className="pb-8 pt-6 px-4"> 
                            <Text className="text-2xl text-center font-medium text-white">
                                Packs de imágenes - {getPaymentProviderName()}
                            </Text>
                            <Text className="text-center text-gray-400 mt-2">
                                Presiona la opción que prefieras
                            </Text>
                            <Text className="text-center text-gray-400 mt-2 text-lg flex items-center justify-center gap-2">
                                {getCurrencyDisplay()}
                            </Text>
                        </View>
                        <View className="flex-col items-center justify-center px-4">
                            <View className="w-full">
                                {convertedPacks.map((pack) => (
                                    <Pressable
                                        key={pack.id}
                                        onPress={() => {
                                            if (isPackDisabled(pack)) return;
                                            if (userCountry === 'AR') {
                                                setSelectedPack(ARG_PACKS[pack.id - 1]);
                                            } else {
                                                setSelectedPack(pack);
                                            }
                                        }}
                                        className={`group relative p-6 rounded-xl transition-all duration-300 mb-4
                                            ${selectedPack?.id === pack.id
                                                ? 'bg-sky-500/20 border-2 border-sky-500'
                                                : 'bg-gray-700 border-2 border-gray-600'}
                                            ${isPackDisabled(pack) ? 'opacity-50' : ''}
                                        `}
                                    >
                                        {({ pressed }) => (
                                          <>
                                            <View className={`flex-col items-center text-center `}>
                                                
                                                {pack.id === 3 && (
                                                    <View className="bg-purple-600 px-4 py-1 rounded-full shadow-lg mb-4">
                                                        <Text className="text-white text-lg font-medium">🎉 30% de descuento</Text>
                                                    </View>
                                                )}
                                                {pack.id === 4 && (
                                                    <View className="bg-purple-600 px-4 py-1 rounded-full shadow-lg mb-4">
                                                        <Text className="text-white text-lg font-medium">🎉 30% de descuento</Text>
                                                    </View>
                                                )}
                                                <Text className="text-3xl font-bold text-white">
                                                    {pack.images} {pack.images === 1 ? 'Imagen' : 'Imágenes'}
                                                </Text>
                                                
                                                <View className="mt-4">
                                                    {pack.id === 3 && ( 
                                                        <Text className="line-through text-gray-400 text-lg">
                                                            {formatPrice(pack.price + pack.price*0.43, userCurrency)}
                                                        </Text>
                                                    )}
                                                    {pack.id === 4 && ( 
                                                        <Text className="line-through text-gray-400 text-lg">
                                                            {formatPrice(pack.price + pack.price*0.45, userCurrency)}
                                                        </Text>
                                                    )}
                                                    <Text className="text-4xl font-bold text-sky-400">
                                                        {formatPrice(pack.price, userCurrency)}
                                                    </Text>
                                                </View>

                                                {pack.discount && (
                                                    <View className="mt-3 px-4 py-1 rounded-full bg-green-900/50">
                                                        <Text className="text-sm font-medium text-green-300">{pack.discount}% de ahorro</Text>
                                                    </View>
                                                )}
                                                <Text className="mt-4 text-sm text-gray-300">
                                                    {pack.images === 1 ? 'Una imagen profesional' : `${pack.images} imágenes profesionales`}
                                                </Text>
                                                {pack.id === 3 && (
                                                    <Text className="mt-2 text-sm text-sky-400">
                                                        Ideal para tiendas medianas
                                                    </Text>
                                                )}
                                            </View>
                                            {isPackDisabled(pack) && (
                                                <Text className="mt-4 text-xs text-red-400 font-semibold text-center">
                                                    No disponible en tu país
                                                </Text>
                                            )}
                                            {
                                                selectedPack && selectedPack.id === pack.id && (
                                                    
                                                    <Pressable
                                                    className={`w-full py-3 rounded-xl mt-4 transition-all duration-300 ease-in-out bg-sky-500 ${loading || !selectedPack ? 'opacity-50' : ''}`}
                                                    onPress={handlePurchase}
                                                    disabled={loading || !selectedPack}
                                                >
                                                    {({ pressed }) => (
                                                    <View className={`flex-row items-center justify-center ${pressed ? 'opacity-80' : ''}`}>
                                                        {loading ? (
                                                            <>
                                                                <ActivityIndicator color="white" className="mr-2" />
                                                                <Text className="text-white text-lg font-semibold">Procesando...</Text>
                                                            </>
                                                        ) : (
                                                            <Text className="text-white text-sm font-semibold">{`Pagar ${selectedPack ? formatPrice(selectedPack.price, userCurrency) : '0'}`}</Text>
                                                        )}
                                                    </View>
                                                    )}
                                                </Pressable>
                                                )
                                            }
                                          </>
                                        )}
                                    </Pressable>
                                ))}
                            </View>

                            {error && (
                                <View className="mt-8 bg-red-900/40 border border-red-800 rounded-lg p-4 flex-row items-center w-full">
                                    <Ionicons name="alert-circle-outline" size={20} color="#f87171" />
                                    <View className="ml-3">
                                        <Text className="font-semibold text-red-200">Error</Text>
                                        <Text className="text-red-200">{error}</Text>
                                    </View>
                                </View>
                            )}

                            <Text className="mt-8 text-sm text-center text-gray-400 max-w-lg">
                                Si ya realizaste tu pago y todavia no lo ves acreditado en la app simplemente sal de la app y vuelve a entrar
                            </Text>
                        </View>
                        <View className="px-8 pb-8 mt-4">
                            <Pressable
                                className={`w-full py-4 rounded-xl transition-all duration-300 ease-in-out bg-sky-500 ${loading || !selectedPack ? 'opacity-50' : ''}`}
                                onPress={handlePurchase}
                                disabled={loading || !selectedPack}
                            >
                                {({ pressed }) => (
                                  <View className={`flex-row items-center justify-center ${pressed ? 'opacity-80' : ''}`}>
                                    {loading ? (
                                        <>
                                            <ActivityIndicator color="white" className="mr-2" />
                                            <Text className="text-white text-lg font-semibold">Procesando...</Text>
                                        </>
                                    ) : (
                                        <Text className="text-white text-lg font-semibold">{`Pagar ${selectedPack ? formatPrice(selectedPack.price, userCurrency) : '0'}`}</Text>
                                    )}
                                  </View>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View className="py-8 items-center">
                    <Text className="text-sm text-gray-400 flex-row items-center gap-2">
                        <Ionicons name="sparkles-outline" size={16} color="#9ca3af" />
                        tiendia.app - Pago seguro
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 