// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // UsuarioApp (seg.UsuarioApp) — viene del login real
  const [user, setUser] = useState(null);

  // Cliente comprador (ventas.Cliente) — viene del registro
  const [cliente, setCliente] = useState(null);

  // Token JWT si el backend lo devuelve
  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedCliente = localStorage.getItem('cliente');

      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedCliente) setCliente(JSON.parse(savedCliente));
    } catch {
      // localStorage corrupto → limpiar
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cliente');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * login: guarda la respuesta real del backend
   * @param {object} responseData - lo que devuelve POST /api/v1/auth/login
   */
  const login = (responseData) => {
    // El backend devuelve: { success, message, data: { usuarioAppId, userName, roles, token, expirationUtc } }
    // auth.service.js retorna response.data (el objeto completo del wrapper)
    const payload = responseData?.data ?? responseData;

    const tokenValue = payload?.token ?? null;

    // Normalizar roles siempre como array de strings
    let normalizedRoles = [];
    if (Array.isArray(payload?.roles)) {
      normalizedRoles = payload.roles.map(r => String(r));
    }

    const userData = {
      ...payload,
      usuarioAppId: payload?.usuarioAppId ?? null,
      userName:     payload?.userName     ?? null,
      nombre:       payload?.nombre        ?? payload?.userName ?? null,
      roles:        normalizedRoles,
    };

    if (tokenValue) {
      setToken(tokenValue);
      localStorage.setItem('token', tokenValue);
    }

    if (userData.userName) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Si el payload trae clienteId, hidratar también el estado de cliente
      if (payload?.clienteId || payload?.ClienteId) {
        const clienteData = {
          clienteId: payload?.clienteId || payload?.ClienteId,
          nombre: payload?.nombre,
          apellido: payload?.apellido,
          email: payload?.email || payload?.userName // fallback si no viene email explícito
        };
        setCliente(clienteData);
        localStorage.setItem('cliente', JSON.stringify(clienteData));
      }
    }
  };

  /**
   * registerCliente: guarda el cliente creado con POST /api/v1/clientes
   * @param {object} clienteData - { clienteId, nombre, apellido, email, ... }
   */
  const registerCliente = (clienteData) => {
    setCliente(clienteData);
    localStorage.setItem('cliente', JSON.stringify(clienteData));
  };

  const logout = () => {
    setUser(null);
    setCliente(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cliente');
  };

  const isAuthenticated = !!(user || cliente);

  return (
    <AuthContext.Provider value={{
      user,
      cliente,
      token,
      loading,
      isAuthenticated,
      login,
      registerCliente,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};