import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cart on component mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart/');
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      const response = await axios.post('/api/cart/add/', {
        product_id: productId,
        variant_id: variantId,
        quantity
      });
      setCart(response.data);
      toast.success('Producto agregado al carrito');
      return { success: true };
    } catch (error) {
      toast.error('Error al agregar producto al carrito');
      return { success: false, error: error.response?.data };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      
      const response = await axios.patch(`/api/cart/items/${itemId}/`, {
        quantity
      });
      setCart(response.data);
    } catch (error) {
      toast.error('Error al actualizar el carrito');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/cart/items/${itemId}/remove/`);
      await loadCart(); // Reload cart after removal
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar producto del carrito');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear/');
      setCart(null);
      toast.success('Carrito limpiado');
    } catch (error) {
      toast.error('Error al limpiar el carrito');
    }
  };

  const getCartItemsCount = () => {
    return cart?.total_items || 0;
  };

  const getCartTotal = () => {
    return cart?.total_price || 0;
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemsCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};


