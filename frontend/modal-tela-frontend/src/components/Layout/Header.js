import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
    }
  };

  return (
    <header className="border-b border-solid border-b-[#f0f2f4] py-3 px-10">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Modal Tela</h2>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-9">
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

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="px-3 py-2 border border-[#dce1e5] rounded-l-full text-sm"
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
                  className="bg-[#3595e3] text-white text-sm font-bold h-10 px-4 rounded-full hover:bg-[#2c7fb0]"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="bg-[#f0f2f4] text-[#111517] text-sm font-bold h-10 px-4 rounded-full hover:bg-[#dce1e5]"
              >
                Mi Cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#f0f2f4] text-[#111517] text-sm font-bold h-10 px-4 rounded-full hover:bg-[#dce1e5]"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="bg-[#f0f2f4] text-[#111517] text-sm font-bold h-10 px-4 rounded-full hover:bg-[#dce1e5]"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-[#3595e3] text-white text-sm font-bold h-10 px-4 rounded-full hover:bg-[#2c7fb0]"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;