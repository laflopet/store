import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos
const WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes del timeout

export const useSessionTimeout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef();
  const warningTimeoutRef = useRef();
  const lastActivityRef = useRef(Date.now());

  const resetTimer = () => {
    if (!user) return;

    lastActivityRef.current = Date.now();

    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Timer de advertencia (25 minutos)
    warningTimeoutRef.current = setTimeout(() => {
      toast.warn('Tu sesión expirará en 5 minutos por inactividad', {
        autoClose: 5000,
        closeOnClick: false,
        draggable: false,
        pauseOnHover: false
      });
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Timer de cierre de sesión (30 minutos)
    timeoutRef.current = setTimeout(() => {
      logout();
      navigate('/login');
      toast.error('Tu sesión ha expirado por inactividad', {
        autoClose: 3000
      });
    }, SESSION_TIMEOUT);
  };

  const handleActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    if (!user) {
      // Limpiar timers si no hay usuario
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    // Eventos que reinician el timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Inicializar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, logout, navigate]);

  return { resetTimer };
};