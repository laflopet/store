import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const miImagen = require('../assets/home/home.jpeg');

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products/featured/'),
        axios.get('/api/products/categories/')
      ]);
      
      // Handle featured products response
      const productsData = productsRes.data?.results || productsRes.data || [];
      setFeaturedProducts(Array.isArray(productsData) ? productsData : []);
      
      // Handle categories response
      const categoriesData = categoriesRes.data?.results || categoriesRes.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setFeaturedProducts([]);
      setCategories([]);
    }
  };

  return (
    <div className="bg-white text-[#111517]">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-20 xl:px-40 gap-6 lg:gap-12">
        <div className="w-full lg:w-1/2">
          <img src={miImagen} alt="Hero principal" className="rounded-lg shadow-lg w-full h-64 sm:h-80 lg:h-96 object-cover" />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.015em]">Un Inicio Refrescante</h1>
          <p className="text-sm sm:text-base leading-normal text-[#647787]">
            Explora nuestras más recientes colecciones de ropa para toda la familia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/products"
              className="bg-[#3595e3] text-white text-sm font-bold leading-normal h-12 px-6 rounded-full hover:bg-[#2c7fb0] inline-flex items-center justify-center"
            >
              Comprar Ahora
            </Link>
            <Link
              to="/consultar-pedido"
              className="bg-white border-2 border-[#3595e3] text-[#3595e3] text-sm font-bold leading-normal h-12 px-6 rounded-full hover:bg-[#3595e3] hover:text-white transition-colors inline-flex items-center justify-center"
            >
              Consultar Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 sm:px-6 lg:px-20 xl:px-40 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Categorías</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories && categories.length > 0 ? categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={category.image || '/api/placeholder/300/200'}
                alt={category.name}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover"
              />
              <div className="p-3 sm:p-4 text-center">
                <h3 className="text-sm sm:text-base font-semibold leading-normal">
                  {category.display_name.charAt(0).toUpperCase() + category.display_name.slice(1)}
                </h3>
              </div>
            </Link>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No hay categorías disponibles</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-20 xl:px-40 py-8 sm:py-12 bg-[#f8f9fa]">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Productos Destacados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={product.main_image || '/api/placeholder/300/300'}
                  alt={product.name}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                />
                <div className="p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-[#647787] text-xs mb-1 sm:mb-2">{product.brand_name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-lg font-bold">${product.price}</span>
                    {!product.is_in_stock && (
                      <span className="text-red-500 text-xs">Agotado</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;