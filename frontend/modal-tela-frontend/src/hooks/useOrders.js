import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/orders/');
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error al cargar pedidos');
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Error al cargar pedido');
      toast.error('Error al cargar pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/orders/create/', orderData);
      
      if (response.data.success) {
        // Refresh orders list
        await fetchOrders();
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error al crear pedido');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al crear pedido';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch orders on mount if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchOrders();
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    createOrder,
    refreshOrders: fetchOrders
  };
};