import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchTimeoutRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Búsqueda removida del useEffect - ahora solo con Enter

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="border-b border-solid border-b-[#f0f2f4] py-3 px-4 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-4">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">Modal Tela</h2>
        </Link>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-9">
          <Link className="text-sm font-medium leading-normal hover:text-[#3595e3]" to="/products?category=hombres">
            Hombres
          </Link>
          <Link className="text-sm font-medium leading-normal hover:text-[#3595e3]" to="/products?category=mujeres">
            Mujeres
          </Link>
          <Link className="text-sm font-medium leading-normal hover:text-[#3595e3]" to="/products?category=ninos">
            Niños
          </Link>
          <Link className="text-sm font-medium leading-normal hover:text-[#3595e3]" to="/products?category=bebes">
            Bebés
          </Link>
          <Link className="text-sm font-medium leading-normal hover:text-[#3595e3]" to="/products?brands=true">
            Marcas
          </Link>
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos (presiona Enter)..."
              className="px-3 py-2 border border-[#dce1e5] rounded-l-full text-sm w-40 xl:w-48"
            />
            <button
              type="submit"
              className="bg-[#f0f2f4] text-[#111517] p-2 rounded-r-full hover:bg-[#dce1e5]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </button>
          </form>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <button className="bg-[#f0f2f4] text-[#111517] p-2 rounded-full hover:bg-[#dce1e5]">
              🛒
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#3595e3] text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="bg-[#3595e3] text-white text-sm font-bold h-10 px-3 xl:px-4 rounded-full hover:bg-[#2c7fb0] flex items-center justify-center"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="bg-[#f0f2f4] text-[#111517] text-sm font-bold h-10 px-3 xl:px-4 rounded-full hover:bg-[#dce1e5] flex items-center justify-center"
              >
                Mi Cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#f0f2f4] text-[#111517] text-sm font-bold h-10 px-3 xl:px-4 rounded-full hover:bg-[#dce1e5] flex items-center justify-center"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="bg-[#f0f2f4] text-[#111517] text-sm font-bold h-10 px-3 xl:px-4 rounded-full hover:bg-[#dce1e5] flex items-center justify-center"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-[#3595e3] text-white text-sm font-bold h-10 px-3 xl:px-4 rounded-full hover:bg-[#2c7fb0] flex items-center justify-center"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Cart and User Icons */}
        <div className="flex lg:hidden items-center gap-2">
          <Link to="/cart" className="relative">
            <button className="bg-[#f0f2f4] text-[#111517] p-2 rounded-full hover:bg-[#dce1e5]">
              🛒
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#3595e3] text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 border-t border-gray-200 pt-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex items-center mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos (presiona Enter)..."
              className="flex-1 px-3 py-2 border border-[#dce1e5] rounded-l-lg text-sm"
            />
            <button
              type="submit"
              className="bg-[#f0f2f4] text-[#111517] p-2 rounded-r-lg hover:bg-[#dce1e5]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </button>
          </form>

          {/* Mobile Navigation */}
          <nav className="space-y-2 mb-4">
            <Link 
              className="block py-2 text-sm font-medium hover:text-[#3595e3]" 
              to="/products?category=hombres"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hombres
            </Link>
            <Link 
              className="block py-2 text-sm font-medium hover:text-[#3595e3]" 
              to="/products?category=mujeres"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mujeres
            </Link>
            <Link 
              className="block py-2 text-sm font-medium hover:text-[#3595e3]" 
              to="/products?category=ninos"
              onClick={() => setMobileMenuOpen(false)}
            >
              Niños
            </Link>
            <Link 
              className="block py-2 text-sm font-medium hover:text-[#3595e3]" 
              to="/products?category=bebes"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bebés
            </Link>
            <Link 
              className="block py-2 text-sm font-medium hover:text-[#3595e3]" 
              to="/products?brands=true"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marcas
            </Link>
          </nav>

          {/* Mobile User Menu */}
          <div className="border-t border-gray-200 pt-4">
            {user ? (
              <div className="space-y-2">
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="block w-full bg-[#3595e3] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#2c7fb0] text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block w-full bg-[#f0f2f4] text-[#111517] text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#dce1e5] text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mi Cuenta
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full bg-[#f0f2f4] text-[#111517] text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#dce1e5] "
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full bg-[#f0f2f4] text-[#111517] text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#dce1e5] text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block w-full bg-[#3595e3] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#2c7fb0] text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;