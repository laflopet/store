import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}/`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/error');
    }
  };

  const handleAddToCart = async () => {
    if (!product.is_in_stock) {
      toast.error('Producto agotado');
      return;
    }

    if (product.variants.length > 0 && !selectedVariant) {
      toast.error('Por favor selecciona una variante');
      return;
    }

    const result = await addToCart(
      product.id,
      selectedVariant?.id,
      quantity
    );

    if (result.success) {
      // No mostrar toast aquí porque ya se muestra en CartContext
    }
  };

  const getPrice = () => {
    if (selectedVariant) {
      return selectedVariant.final_price;
    }
    return product.price;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando producto...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-screen">Producto no encontrado</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-20 xl:px-40 py-6 sm:py-8 min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            <img
              src={product.images[selectedImage]?.image || product.main_image || '/api/placeholder/600/600'}
              alt={product.name}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-[#3595e3]' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-[#647787] mb-2 text-sm sm:text-base">{product.brand_name}</p>
          <p className="text-[#647787] mb-4 text-sm sm:text-base">{product.category_name} - {product.subcategory_name}</p>
          
          <div className="mb-6">
            <span className="text-2xl sm:text-3xl font-bold">${getPrice()}</span>
            {!product.is_in_stock && (
              <span className="ml-4 text-red-500 font-medium text-sm sm:text-base">Agotado</span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Opciones</h3>
              <div className="space-y-4">
                {/* Size and Color Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Talla y Color</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={`p-3 border rounded-lg text-sm ${
                          selectedVariant?.id === variant.id
                            ? 'border-[#3595e3] bg-[#3595e3] text-white'
                            : variant.stock === 0
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-[#3595e3]'
                        }`}
                      >
                        {variant.size} - {variant.color}
                        {variant.stock === 0 && ' (Agotado)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Cantidad</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
            className="w-full bg-[#3595e3] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2c7fb0] disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
          >
            {product.is_in_stock ? 'Agregar al carrito' : 'Producto agotado'}
          </button>

          {/* Product Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Descripción</h3>
            <p className="text-[#647787] leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;