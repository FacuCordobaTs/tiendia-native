import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.tiendia.app/api/auth';

interface LoginResponse {
  message: string;
  user: any[];
  token?: string;
}

interface RegisterResponse {
  message: string;
  newUser: any[];
  token?: string;
}

interface ProfileResponse {
  user: any[];
}

class AuthService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Extract token from cookies (we'll need to handle this differently in mobile)
      // For now, we'll assume the token is returned in the response
      const token = data.token || 'mobile-token-placeholder';

      return {
        user: data.user[0],
        token,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async loginOrRegister(email: string, password: string): Promise<{ user: any; token: any}> {
    try {
      const response = await fetch(`${API_BASE_URL}/login-or-register`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión o registrar');
      }

      const token = data.token;
      
      return {
        user: data.user[0],
        token,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async register(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar');
      }

      const token = data.token || 'mobile-token-placeholder';

      return {
        user: data.newUser[0],
        token,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const data: ProfileResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.user?.[0]?.message || 'Error al obtener perfil');
      }

      return data.user[0];
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Don't throw error for logout, just log it
    }
  }

  async createStore(storeData: {
    storeName: string;
    storeLogo?: string;
    phoneNumber: string;
    countryCode: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/mi-tiendia`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(storeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la tienda');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión');
    }
  }
}

export const authService = new AuthService(); 