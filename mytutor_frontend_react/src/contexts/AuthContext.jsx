import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';
import { usuarioApi } from '../api/usuarioApi';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider montado, llamando a checkAuth inicial');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 checkAuth - Token:', token ? `Existe (${token.substring(0, 20)}...)` : 'No existe');
    
    if (token) {
      try {
        console.log('📡 Obteniendo perfil de usuario...');
        const userData = await usuarioApi.getMyProfile();
        console.log('✅ Usuario obtenido:', userData);
        
        console.log('📡 Obteniendo rol...');
        const roleData = await usuarioApi.getMyRole();
        console.log('✅ Rol obtenido:', roleData);
        
        setUser(userData);
        setRole(roleData);
        setLoading(false);
        console.log('✅ Estado actualizado correctamente');
        return { user: userData, role: roleData };
      } catch (error) {
        console.error('❌ Error en checkAuth:', error);
        authApi.logout();
        setUser(null);
        setRole(null);
        setLoading(false);
        return null;
      }
    } else {
      console.log('⚠️ No hay token');
      setLoading(false);
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Login iniciado con:', credentials.nombreUsuario);
      
      // Hacer login y obtener token
      const data = await authApi.login(credentials);
      console.log('✅ Login exitoso, token guardado');
      
      // Verificar que el token existe antes de continuar
      const savedToken = localStorage.getItem('token');
      console.log('🔍 Verificando token guardado:', savedToken ? 'Existe' : 'NO EXISTE');
      
      if (!savedToken) {
        throw new Error('Token no se guardó correctamente');
      }
      
      // Esperar un momento y luego cargar el usuario
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔄 Cargando usuario después del login...');
      const authResult = await checkAuth();
      console.log('✅ Auth completado:', authResult);
      
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registro iniciado...');
      const data = await authApi.register(userData);
      console.log('✅ Registro exitoso');
      return data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Cerrando sesión');
    authApi.logout();
    setUser(null);
    setRole(null);
  };

  const updateUser = (updatedUserData) => {
    console.log('🔄 Actualizando datos del usuario en contexto:', updatedUserData);
    setUser(updatedUserData);
  };

  console.log('📊 AuthProvider state:', { 
    hasUser: !!user, 
    userName: user?.nombre, 
    loading,
    hasToken: !!localStorage.getItem('token')
  });

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
