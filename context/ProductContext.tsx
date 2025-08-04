import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productService } from '../lib/productService';
import { useAuth } from './AuthContext';
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
interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  getProducts: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getUserImages: () => Promise<void>;
  userImages: Image[];
  deleteImage: (id: number) => Promise<void>;
  setUserImages: (images: Image[]) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userImages, setUserImages] = useState<Image[]>([]);
  const { user } = useAuth();

  const getProducts = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      const productsData = await productService.getProducts(user.id);
      setProducts(productsData);
    } catch (error) {
      // console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      // console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getUserImages = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      const result = await productService.getUserImages(user.id);
      setUserImages(result);
    } catch (error) {
      // console.error('Error fetching user images:', error);
    }
  };

  const deleteImage = async (id: number) => {
    try {
      await productService.deleteImage(id);
      setUserImages(prev => prev.filter(image => image.imageId !== id));
    } catch (error) {
      // console.error('Error deleting image:', error);  
      throw error;
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const value: ProductContextType = {
    products,
    userImages,
    isLoading,
    getProducts,
    deleteProduct,
    getUserImages,
    deleteImage,
    setUserImages,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 