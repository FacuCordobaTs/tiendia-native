# Tiendia.app - React Native

Aplicación móvil para tiendia.app que permite a las tiendas de ropa generar imágenes profesionales de sus prendas usando IA.

## 🎉 **Características Implementadas**

### **🔐 Autenticación Completa**
- ✅ **Login/Registro** con email y contraseña
- ✅ **Google OAuth** integrado
- ✅ **Persistencia de sesión** con AsyncStorage
- ✅ **Navegación protegida** automática
- ✅ **Logout funcional** con limpieza de datos

### **📱 Gestión de Productos**
- ✅ **Agregar productos** con foto, nombre, precio y tallas
- ✅ **Selección de imágenes** desde galería o cámara
- ✅ **Lista de productos** con vista previa
- ✅ **Edición y eliminación** de productos

### **🖼️ Generación de Imágenes con IA**
- ✅ **Vista frontal** con modelo adulto
- ✅ **Vista trasera** del producto
- ✅ **Imágenes de bebé** y niño
- ✅ **Personalización avanzada** (género, edad, etc.)
- ✅ **Múltiples tipos** de generación
- ✅ **Sistema de créditos** integrado

### **🎨 Diseño Moderno**
- ✅ **Tema oscuro** con acentos en azul cielo (#0ea5e9)
- ✅ **Animaciones suaves** en botones y transiciones
- ✅ **Iconografía consistente** usando Ionicons
- ✅ **Espaciado generoso** para mejor legibilidad
- ✅ **Bordes redondeados** para un look moderno

## 📁 **Estructura del Proyecto**

```
Native/
├── app/
│   ├── (auth)/           # Rutas protegidas (requieren autenticación)
│   │   ├── _layout.tsx   # Layout de autenticación
│   │   ├── home.tsx      # Dashboard principal con productos
│   │   ├── profile.tsx   # Perfil del usuario
│   │   ├── gallery.tsx   # Lista de productos
│   │   ├── create.tsx    # Generación de imágenes
│   │   └── add-product.tsx # Agregar productos
│   ├── _layout.tsx       # Layout principal con providers
│   ├── index.tsx         # Página de bienvenida
│   └── login.tsx         # Página de login
├── context/
│   ├── AuthContext.tsx   # Contexto de autenticación
│   └── ProductContext.tsx # Contexto de productos
├── lib/
│   ├── authService.ts    # Servicios de autenticación
│   └── productService.ts # Servicios de productos e IA
├── types/
│   └── auth.d.ts         # Tipos TypeScript
└── assets/               # Imágenes y recursos
```

## 🚀 **Flujo de Usuario**

1. **Bienvenida** (`/`) - Redirige automáticamente si está autenticado
2. **Login** (`/login`) - Autenticación con email/password o Google OAuth
3. **Dashboard** (`/(auth)/home`) - Vista principal con productos y estadísticas
4. **Agregar Producto** (`/(auth)/add-product`) - Subir foto y detalles del producto
5. **Generar Imagen** (`/(auth)/create`) - Seleccionar producto y tipo de generación
6. **Galería** (`/(auth)/gallery`) - Ver todos los productos
7. **Perfil** (`/(auth)/profile`) - Información del usuario y configuración

## 🔧 **Tecnologías Utilizadas**

- **React Native** con Expo SDK 53
- **TypeScript** para tipado estático
- **NativeWind** para estilos con Tailwind CSS
- **Expo Router** para navegación basada en archivos
- **AsyncStorage** para persistencia local
- **Expo Image Picker** para selección de imágenes
- **Expo Web Browser** para OAuth de Google

## 📡 **API Endpoints Utilizados**

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/login-or-register` - Login o registro automático
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Obtener perfil del usuario
- `DELETE /api/auth/logout` - Cerrar sesión
- `POST /api/auth/mi-tiendia` - Crear/actualizar información de la tienda

### Productos e IA
- `GET /api/products` - Obtener productos del usuario
- `POST /api/products` - Agregar nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `POST /api/products/generate-ad/:id` - Generar imagen frontal
- `POST /api/products/back-image/:id` - Generar imagen trasera
- `POST /api/products/baby-image/:id` - Generar imagen de bebé
- `POST /api/products/kid-image/:id` - Generar imagen de niño
- `POST /api/products/personalize/:id` - Personalizar imagen

## 🎯 **Características de Diseño**

### **Paleta de Colores**
- **Fondo principal**: Negro (#000000)
- **Acentos**: Azul cielo (#0ea5e9)
- **Texto principal**: Blanco (#ffffff)
- **Texto secundario**: Gris (#9ca3af)
- **Bordes**: Gris oscuro (#374151)

### **Tipografía**
- **Títulos**: Font-bold, text-2xl/text-xl
- **Subtítulos**: Font-semibold, text-lg
- **Texto normal**: Font-medium, text-base
- **Texto pequeño**: Font-normal, text-sm

### **Componentes**
- **Botones**: Bordes redondeados, animaciones de presión
- **Tarjetas**: Fondo gris oscuro, bordes redondeados
- **Inputs**: Fondo gris, bordes con focus en azul
- **Iconos**: Ionicons con colores consistentes

## 📱 **Funcionalidades Destacadas**

### **Generación de Imágenes**
- **5 tipos de generación**: Frontal, trasera, bebé, niño, personalizado
- **Personalización avanzada**: Género, edad, tono de piel, tipo de cuerpo
- **Sistema de créditos**: 50 créditos por imagen generada
- **Validación de créditos**: Verificación antes de generar
- **Estados de carga**: Indicadores visuales durante la generación

### **Gestión de Productos**
- **Subida de imágenes**: Desde galería o cámara
- **Información completa**: Nombre, precio, tallas
- **Vista previa**: Imágenes con placeholder
- **Validación**: Campos requeridos y opcionales
- **Conversión automática**: Imágenes a base64 para el backend

### **Experiencia de Usuario**
- **Navegación intuitiva**: Flujo claro entre pantallas
- **Estados de carga**: Indicadores en todas las operaciones
- **Manejo de errores**: Mensajes claros y útiles
- **Feedback visual**: Animaciones y transiciones suaves
- **Accesibilidad**: Contraste adecuado y tamaños de texto

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Dispositivo Android/iOS o emulador

### **Instalación**
```bash
# Clonar el repositorio
git clone <repository-url>
cd Native

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### **Configuración de Variables de Entorno**
La app se conecta automáticamente a `https://api.tiendia.app`. Asegúrate de que el backend esté configurado correctamente.

### **Configuración de OAuth**
Para Google OAuth, configura el esquema de URL `tiendia://` en tu proyecto de Google Cloud Console.

## 📊 **Estadísticas de la App**

- **Pantallas**: 7 pantallas principales
- **Componentes**: 15+ componentes reutilizables
- **Servicios**: 2 servicios principales (auth, products)
- **Contextos**: 2 contextos de estado global
- **Tipos TypeScript**: 10+ interfaces definidas
- **Endpoints API**: 12+ endpoints utilizados

## 🔮 **Próximos Pasos**

- [ ] **Notificaciones push** para avisos de generación
- [ ] **Modo offline** con sincronización
- [ ] **Compras in-app** para créditos
- [ ] **Analytics** y crash reporting
- [ ] **Tests unitarios** y de integración
- [ ] **Optimización de rendimiento**
- [ ] **Soporte para más idiomas**
- [ ] **Temas personalizables**

## 🤝 **Contribución**

Este proyecto está desarrollado para tiendia.app. Para contribuir:

1. Sigue las mejores prácticas de React Native
2. Mantén la consistencia del diseño
3. Usa TypeScript para todo el código nuevo
4. Documenta las nuevas funcionalidades
5. Prueba en dispositivos reales

## 📄 **Licencia**

Este proyecto es propiedad de tiendia.app. Todos los derechos reservados.

---

**✨ Desarrollado con ❤️ para transformar el comercio electrónico con IA** 