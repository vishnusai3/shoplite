import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  subtotalCents: number;
  addToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1): Promise<{ success: boolean; message?: string }> => {
    try {
      const updated = await api.addToCart(productId, quantity);
      setCart(updated);
      return { success: true, message: 'Added to your bag' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to add item' };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<void> => {
    try {
      const updated = await api.updateCartQuantity(itemId, quantity);
      setCart(updated);
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
      alert(err.message || 'Could not update quantity');
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    try {
      const updated = await api.removeCartItem(itemId);
      setCart(updated);
    } catch (err: any) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      await api.clearCart();
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  };

  const itemCount = cart?.itemCount || 0;
  const subtotalCents = cart?.subtotalCents || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotalCents,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
