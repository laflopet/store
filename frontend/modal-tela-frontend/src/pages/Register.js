import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';



const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  //const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);

    const result = await axios.post('http://127.0.0.1:8000/api/accounts/register/', formData)//await register(formData);
    
    if (result.success) {
      toast.success('¡Registro exitoso! Bienvenido a Modal Tela');
      navigate('/');
    } else {
      if (typeof result.error === 'object') {
        Object.values(result.error).forEach(errors => {
          if (Array.isArray(errors)) {
            errors.forEach(error => toast.error(error));
          } else {
            toast.error(errors);
          }
        });
      } else {
        toast.error(result.error);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="px-40 flex flex-1 justify-center py-5 min-h-screen bg-white">
      <div className="flex flex-col w-[512px] max-w-[512px] py-5">
        <h1 className="text-[#111517] tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
          Regístrate
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Nombre</p>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Apellido</p>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Usuario</p>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Correo Electrónico</p>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@mail.com"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Teléfono</p>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Fecha de nacimiento</p>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Género</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
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
              />
            </label>
          </div>
          
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#111517] text-base font-medium leading-normal pb-2">Confirmar Contraseña</p>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111517] focus:outline-0 focus:ring-0 border border-[#dce1e5] bg-white focus:border-[#3595e3] h-14 placeholder:text-[#647787] p-[15px] text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          <div className="flex justify-stretch">
            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
              <Link
                to="/login"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f0f2f4] text-[#111517] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#dce1e5]"
              >
                <span className="truncate">Ya tengo cuenta</span>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#3595e3] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2c7fb0] disabled:opacity-50"
              >
                <span className="truncate">{loading ? 'Cargando...' : 'Registrarse'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;