import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useOrders } from '../hooks/useOrders';
import { getDepartments, getCitiesByDepartment } from '../data/colombiaData';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder, loading } = useOrders();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: '',
    department: '',
    city: '',
    postal_code: '',
    notes: '',
    payment_method: 'bank_transfer'
  });

  const [departments] = useState(getDepartments());
  const [cities, setCities] = useState([]);
  
  useEffect(() => {
    if (formData.department) {
      setCities(getCitiesByDepartment(formData.department));
      setFormData(prev => ({ ...prev, city: '' })); // Reset city when department changes
    } else {
      setCities([]);
    }
  }, [formData.department]);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['email', 'first_name', 'last_name', 'phone', 'address', 'department', 'city'];
    for (let field of required) {
      if (!formData[field].trim()) {
        const fieldNames = {
          email: 'Email',
          first_name: 'Nombre',
          last_name: 'Apellido',
          phone: 'Teléfono',
          address: 'Dirección',
          department: 'Departamento',
          city: 'Ciudad'
        };
        toast.error(`El campo ${fieldNames[field]} es obligatorio`);
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const orderData = {
      ...formData,
      items: cart.items.map(item => ({
        product_id: item.product.id,
        variant_id: item.variant?.id,
        quantity: item.quantity,
        price: item.price || (item.variant ? item.variant.final_price : item.product.price)
      })),
      total_amount: getCartTotal()
    };

    const result = await createOrder(orderData);
    
    if (result && result.success) {
      await clearCart();
      toast.success('¡Pedido realizado exitosamente!');
      navigate(`/order-confirmation/${result.order.id}`);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Checkout */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Información de envío</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apellido *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium mb-2">Dirección *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número, apartamento, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Departamento *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar departamento</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.department}
                  >
                    <option value="">Seleccionar ciudad</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Código postal</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium mb-2">Método de pago</label>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="payment_method"
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={handleInputChange}
                      className="mr-2"
                      disabled
                    />
                    <label htmlFor="bank_transfer" className="text-sm font-medium">
                      Transferencia bancaria (Único método disponible)
                    </label>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Información bancaria:</strong><br />
                      Banco: Bancolombia<br />
                      Cuenta de ahorros: 123-456-789-00<br />
                      Titular: Modal Tela S.A.S<br />
                      NIT: 900.123.456-7
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Envía el comprobante de pago al email: pagos@modaltela.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="block text-sm font-medium mb-2">Notas adicionales</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Instrucciones especiales para la entrega..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Realizar pedido'}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold mb-6">Resumen del pedido</h2>
            
            {/* Lista de productos */}
            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.main_image || '/api/placeholder/60/60'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate" title={item.product.name}>
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-xs truncate" title={item.product.brand_name}>
                      {item.product.brand_name}
                    </p>
                    {item.variant && (
                      <p className="text-gray-600 text-xs">
                        {item.variant.size} - {item.variant.color}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Cant: {item.quantity}</span>
                      <span className="font-semibold text-sm">${item.subtotal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${getCartTotal()}</span>
              </div>
            </div>

            {/* Información de envío */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Información de envío</h4>
              <p className="text-blue-700 text-sm">
                • Envío gratis en toda Colombia<br/>
                • Tiempo de entrega: 2-5 días hábiles<br/>
                • Seguimiento incluido
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;