import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.tiendia.app/api/products';

interface Product {
  id: number;
  name: string;
  imageURL: string | null;
  price?: number;
  sizes?: string;
  storeImageURLs?: string;
  createdById?: number;
}

interface Image {
  imageId: number;
  imageUrl: string;
  productId: number;
  productName: string;
  createdAt: string;
}

interface GeneratedImageResponse {
  adImageUrl?: string;
  backImageUrl?: string;
  babyImageUrl?: string;
  kidImageUrl?: string;
  personalizedImageUrl?: string;
  imageId?: number;
}

class ProductService {

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getProducts(userId: number): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/list/${userId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data = await response.json();
      return data.products || [];
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar producto');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async generateAd(id: number, includeModel: boolean = true): Promise<GeneratedImageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-ad/${id}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ includeModel }),
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar imagen');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async generateBackImage(id: number): Promise<GeneratedImageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/back-image/${id}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar imagen de espalda');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async generateBabyImage(id: number): Promise<GeneratedImageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/baby-image/${id}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar imagen de bebé');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async generateKidImage(id: number): Promise<GeneratedImageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/kid-image/${id}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar imagen de niño');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async personalizeImage(id: number, personalization: {
    gender?: string;
    age?: string;
    skinTone?: string;
    bodyType?: string;
  }): Promise<GeneratedImageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/personalize/${id}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(personalization),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al personalizar imagen');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async uploadImage(imageUri: string): Promise<string> {
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      throw new Error('Error al procesar la imagen');
    }
  }

  async getUserImages(userId: number): Promise<Image[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/images/by-user/${userId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener imágenes del usuario');
      }
      const data = await response.json();
      return data.images || [];
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }
  
  async deleteImage(imageId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar imagen');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }
}

export const productService = new ProductService(); 