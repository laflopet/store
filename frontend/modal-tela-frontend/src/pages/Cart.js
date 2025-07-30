import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-20 xl:px-40 py-8 min-h-screen bg-white">
        <div className="text-center py-12">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-[#647787] mb-6">¡Explora nuestros productos y encuentra algo increíble!</p>
          <Link
            to="/products"
            className="bg-[#3595e3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2c7fb0] inline-block"
          >
            Ir a comprar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-20 xl:px-40 py-6 sm:py-8 min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Carrito de compras</h1>
            <button
              onClick={clearCart}
              className="text-red-500 hover:underline text-sm sm:text-base"
            >
              Limpiar carrito
            </button>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={item.product.main_image || '/api/placeholder/100/100'}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base truncate">{item.product.name}</h3>
                    <p className="text-xs sm:text-sm text-[#647787] mb-2">{item.product.brand_name}</p>
                    
                    {item.variant && (
                      <p className="text-xs sm:text-sm text-[#647787] mb-2">
                        {item.variant.size} - {item.variant.color}
                      </p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 sm:w-12 text-center text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-sm sm:text-base">${item.subtotal}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 text-xs sm:text-sm hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="bg-[#f8f9fa] p-6 rounded-lg h-fit">
          <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getCartTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${getCartTotal()}</span>
              </div>
            </div>
          </div>
          
          <Link
            to="/checkout"
            className="w-full bg-[#3595e3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2c7fb0] block text-center"
          >
            Proceder al pago
          </Link>
          
          <Link
            to="/products"
            className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 block text-center"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;