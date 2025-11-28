import axiosInstance from '../config/axiosConfig';

export const usuarioApi = {
  getMyProfile: async () => {
    console.log('📡 usuarioApi.getMyProfile - Obteniendo MI perfil...');
    try {
      const response = await axiosInstance.get('/api/usuario');
      console.log('✅ usuarioApi.getMyProfile - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ usuarioApi.getMyProfile - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateMyProfile: async (userData) => {
    console.log('📤 usuarioApi.updateMyProfile - Datos a actualizar:', JSON.stringify(userData, null, 2));
    try {
      const response = await axiosInstance.put('/api/usuario', userData);
      console.log('✅ usuarioApi.updateMyProfile - Perfil actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ usuarioApi.updateMyProfile - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAccount: async () => {
    console.log('🗑️ usuarioApi.deleteAccount - Eliminando cuenta del usuario');
    try {
      const response = await axiosInstance.delete('/api/usuario');
      console.log('✅ usuarioApi.deleteAccount - Cuenta eliminada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ usuarioApi.deleteAccount - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteUserById: async (id) => {
    console.log('🗑️ usuarioApi.deleteUserById - ID:', id);
    try {
      const response = await axiosInstance.delete(`/api/usuario/${id}`);
      console.log('✅ usuarioApi.deleteUserById - Usuario desactivado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ usuarioApi.deleteUserById - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllUsers: async () => {
    console.log('📡 usuarioApi.getAllUsers - Obteniendo todos los usuarios (ADMIN)...');
    try {
      const response = await axiosInstance.get('/api/usuario/list');
      console.log('✅ usuarioApi.getAllUsers - Total usuarios:', response.data.length);
      if (response.data.length > 0) {
        console.log('✅ Primer usuario:', JSON.stringify(response.data[0], null, 2));
      }
      return response.data;
    } catch (error) {
      console.error('❌ usuarioApi.getAllUsers - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyRole: async () => {
    const response = await axiosInstance.get('/api/usuario/getMyRole');
    return response.data;
  },
};
