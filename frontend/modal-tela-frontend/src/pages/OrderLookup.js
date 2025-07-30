import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderLookup = () => {
  const [searchData, setSearchData] = useState({
    order_number: '',
    email: ''
  });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchData.order_number.trim() || !searchData.email.trim()) {
      toast.error('Por favor ingresa el número de pedido y el email');
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      const response = await axios.post('/api/orders/lookup/', {
        order_number: searchData.order_number.trim(),
        email: searchData.email.trim()
      });
      
      setOrder(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No se encontró un pedido con esos datos');
      } else {
        toast.error('Error al buscar el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pendiente',
      'preparing': 'Preparando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'rejected': 'Rechazado'
    };
    return texts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'preparing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Consultar Estado del Pedido</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Número de Pedido *
                </label>
                <input
                  type="text"
                  name="order_number"
                  value={searchData.order_number}
                  onChange={handleInputChange}
                  placeholder="Ej: ABC12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  name="email"
                  value={searchData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#3595e3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2c7fb0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Consultar Pedido'}
            </button>
          </form>

          {/* Search Results */}
          {searched && !loading && !order && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pedido no encontrado</h3>
              <p className="text-gray-600">Verifica que el número de pedido y email sean correctos</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="border-t pt-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📦</div>
                <h2 className="text-xl font-bold">Pedido #{order.order_number}</h2>
                <p className="text-gray-600">Realizado el {new Date(order.created_at).toLocaleDateString('es-CO')}</p>
              </div>

              {/* Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  
                  {/* Tracking Information */}
                  {order.status === 'shipped' && order.tracking_number && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Número de guía:</span>
                        <span className="ml-2 font-mono bg-white px-2 py-1 rounded border">
                          {order.tracking_number}
                        </span>
                      </div>
                      {order.shipping_company && (
                        <div className="text-sm">
                          <span className="font-medium">Empresa transportadora:</span>
                          <span className="ml-2">{order.shipping_company}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={item.product?.main_image || '/api/placeholder/60/60'}
                        alt={item.product?.name || 'Producto'}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product?.name || 'Producto'}</h4>
                        <p className="text-xs text-gray-600">{item.product?.brand_name}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-600">
                            {item.variant.size} - {item.variant.color}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600">Cantidad: {item.quantity}</span>
                          <span className="font-semibold text-sm">${item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total del Pedido:</span>
                  <span className="text-lg font-bold">${order.total}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Información de envío</h4>
                <p>{order.shipping_first_name} {order.shipping_last_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_department}</p>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-[#3595e3] hover:text-[#2c7fb0] font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderLookup;