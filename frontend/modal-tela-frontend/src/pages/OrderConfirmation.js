import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
      setError('No se pudo cargar la información del pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando información del pedido...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">¡Pedido Confirmado!</h1>
            <p className="text-green-100">Tu pedido ha sido procesado exitosamente</p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Información del Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de pedido:</span>
                    <span className="font-semibold">#{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span>{new Date(order.created_at).toLocaleDateString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      {order.status === 'pending' ? 'Pendiente' : 
                       order.status === 'processing' ? 'Procesando' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <span>{order.payment_method === 'cash_on_delivery' ? 'Pago contra entrega' : 'Transferencia bancaria'}</span>
                  </div>
                  {order.status === 'shipped' && order.tracking_number && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Número de guía:</span>
                        <span className="font-semibold">{order.tracking_number}</span>
                      </div>
                      {order.shipping_company && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Empresa transportadora:</span>
                          <span>{order.shipping_company}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Información de Envío</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">{order.first_name} {order.last_name}</p>
                  <p>{order.address}</p>
                  <p>{order.city} {order.postal_code && `- ${order.postal_code}`}</p>
                  <p className="mt-2">
                    <span className="font-medium">Teléfono:</span> {order.phone}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {order.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Productos Ordenados</h3>
              <div className="space-y-4">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product?.main_image || '/api/placeholder/80/80'}
                      alt={item.product?.name || 'Producto'}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm sm:text-base">{item.product?.name || 'Producto'}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{item.product?.brand_name}</p>
                      {item.variant && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {item.variant.size} - {item.variant.color}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                        <span className="font-semibold">${item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-6 mb-8">
              <div className="flex justify-between text-lg font-bold">
                <span>Total del Pedido:</span>
                <span>${order.total_amount}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">*Envío incluido</p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">¿Qué sigue?</h3>
              <ul className="text-blue-700 text-sm space-y-2">
                <li>• Te enviaremos un email de confirmación a {order.email}</li>
                <li>• Procesaremos tu pedido en las próximas 24 horas</li>
                <li>• Te notificaremos cuando tu pedido sea enviado</li>
                <li>• El tiempo estimado de entrega es de 2-5 días hábiles</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 text-center"
              >
                Seguir Comprando
              </Link>
              <Link
                to="/"
                className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 text-center"
              >
                Ir al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;