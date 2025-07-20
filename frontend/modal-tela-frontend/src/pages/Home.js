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
      setFeaturedProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="bg-white text-[#111517]">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-center py-12 px-40 gap-6">
        <div className="w-full md:w-1/2">
          <img src={miImagen} alt="Hero principal" className="rounded-lg shadow-lg w-full" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-[-0.015em]">Un Inicio Refrescante</h1>
          <p className="text-base leading-normal text-[#647787]">
            Explora nuestras más recientes colecciones de ropa para toda la familia
          </p>
          <Link
            to="/products"
            className="bg-[#3595e3] text-white text-sm font-bold leading-normal h-12 px-6 rounded-full hover:bg-[#2c7fb0] inline-flex items-center justify-center"
          >
            Comprar Ahora
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-40 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={category.image || '/api/placeholder/300/200'}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-base font-semibold leading-normal">
                  {category.name === 'hombres' ? 'Hombres' :
                   category.name === 'mujeres' ? 'Mujeres' :
                   category.name === 'ninos' ? 'Niños' : 'Bebés'}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="px-40 py-12 bg-[#f8f9fa]">
          <h2 className="text-2xl font-bold text-center mb-8">Productos Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={product.main_image || '/api/placeholder/300/300'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-[#647787] text-xs mb-2">{product.brand_name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">${product.price}</span>
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