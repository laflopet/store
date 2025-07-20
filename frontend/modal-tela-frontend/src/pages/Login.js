import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('¡Bienvenido!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="px-40 flex flex-1 justify-center py-5 min-h-screen bg-white">
      <div className="flex flex-col w-[512px] max-w-[512px] py-5">
        <h2 className="text-[#111517] text-lg font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-2 pt-4">
          Bienvenido
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Email</p>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
                placeholder="ejemplo@mail.com"
              />
            </label>
          </div>
          
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Contraseña</p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
                placeholder="Tu contraseña"
              />
            </label>
          </div>
          
          <div className="flex px-4 py-3">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#3595e3] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2c7fb0] disabled:opacity-50"
            >
              <span className="truncate">{loading ? 'Cargando...' : 'Iniciar Sesión'}</span>
            </button>
          </div>
        </form>
        
        <p className="text-[#647787] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#3595e3] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
