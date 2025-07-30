import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');


  useEffect(() => {
    loadData();
  }, [searchParams]);

  useEffect(() => {
    // Update search term when URL params change
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        axios.get('/api/products/', { params }),
        axios.get('/api/products/categories/'),
        axios.get('/api/products/brands/')
      ]);
      
      // Handle products response
      const productsData = productsRes.data?.results || productsRes.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      // Handle categories response
      const categoriesData = categoriesRes.data?.results || categoriesRes.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      // Handle brands response
      const brandsData = brandsRes.data?.results || brandsRes.data || [];
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Loading size="lg" text="Cargando productos..." />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-20 xl:px-40 py-6 sm:py-8 min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 bg-[#f8f9fa] p-4 sm:p-6 rounded-lg h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-[#3595e3] text-sm hover:underline"
            >
              Limpiar
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newParams = new URLSearchParams(searchParams);
                  if (searchTerm.trim()) {
                    newParams.set('search', searchTerm);
                  } else {
                    newParams.delete('search');
                  }
                  setSearchParams(newParams);
                }
              }}
              placeholder="Buscar productos... (Presiona Enter)"
              className="w-full px-3 py-2 border border-[#dce1e5] rounded-lg"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              value={searchParams.get('category') || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce1e5] rounded-lg"
            >
              <option value="">Todas las categorías</option>
              {categories && categories.length > 0 && categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.display_name.charAt(0).toUpperCase() + category.display_name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Brands */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Marca</label>
            <select
              value={searchParams.get('brand') || ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce1e5] rounded-lg"
            >
              <option value="">Todas las marcas</option>
              {brands && brands.length > 0 && brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">Ordenar por</label>
            <select
              value={searchParams.get('ordering') || ''}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="w-full px-3 py-2 border border-[#dce1e5] rounded-lg"
            >
              <option value="">Más recientes</option>
              <option value="price">Precio: menor a mayor</option>
              <option value="-price">Precio: mayor a menor</option>
              <option value="name">Nombre A-Z</option>
              <option value="-name">Nombre Z-A</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6">
            {/* <h1 className="text-2xl font-bold">
              Productos ({products ? products.length : 0})
            </h1> */}
          </div>

          {!products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#647787] text-lg">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
