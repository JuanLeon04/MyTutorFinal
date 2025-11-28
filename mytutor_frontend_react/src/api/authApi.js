import axiosInstance from './axiosConfig';

export const authApi = {
  register: async (userData) => {
    console.log('📝 authApi.register - Enviando registro:', {
      ...userData,
      password: '***',
      fotoPerfil: userData.fotoPerfil ? 'Base64 presente' : 'Sin foto'
    });
    try {
      const response = await axiosInstance.post('/auth/register', {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        telefono: userData.telefono || '',
        fotoPerfil: userData.fotoPerfil || '',
        nombreUsuario: userData.nombreUsuario,
        password: userData.password
      });
      console.log('✅ authApi.register - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ authApi.register - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    console.log('🔐 authApi.login - Enviando credenciales:', {
      nombreUsuario: credentials.nombreUsuario,
      password: '***'
    });
    try {
      // El backend espera: { nombreUsuario: string, password: string }
      const response = await axiosInstance.post('/auth/login', {
        nombreUsuario: credentials.nombreUsuario,
        password: credentials.password
      });
      console.log('✅ authApi.login - Respuesta:', response.data);
      
      if (response.data && typeof response.data === 'string') {
        localStorage.setItem('token', response.data);
        console.log('✅ Token guardado en localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ authApi.login - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    console.log('👋 authApi.logout - Eliminando token');
    localStorage.removeItem('token');
    console.log('✅ Token eliminado');
  },
};
