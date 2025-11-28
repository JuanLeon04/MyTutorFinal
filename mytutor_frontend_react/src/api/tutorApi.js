import axiosInstance from './axiosConfig';

export const tutorApi = {
  getMyTutorProfile: async () => {
    console.log('📡 tutorApi.getMyTutorProfile - Obteniendo MI perfil de tutor...');
    try {
      const response = await axiosInstance.get('/api/tutor');
      console.log('✅ tutorApi.getMyTutorProfile - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.getMyTutorProfile - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateMyTutorProfile: async (tutorData) => {
    console.log('📤 tutorApi.updateMyTutorProfile - Datos a actualizar:', JSON.stringify(tutorData, null, 2));
    try {
      const response = await axiosInstance.put('/api/tutor', tutorData);
      console.log('✅ tutorApi.updateMyTutorProfile - Perfil actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.updateMyTutorProfile - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  deactivateMyTutorProfile: async () => {
    const response = await axiosInstance.delete('/api/tutor');
    return response.data;
  },

  becomeTutor: async (tutorData) => {
    console.log('📤 tutorApi.becomeTutor - Datos enviados:', JSON.stringify(tutorData, null, 2));
    try {
      const response = await axiosInstance.post('/api/tutor/crear', tutorData);
      console.log('✅ tutorApi.becomeTutor - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.becomeTutor - Error:', error.response?.data || error.message);
      console.error('❌ tutorApi.becomeTutor - Status:', error.response?.status);
      throw error;
    }
  },

  getTutorById: async (id) => {
    console.log('📡 tutorApi.getTutorById - ID:', id);
    try {
      const response = await axiosInstance.get(`/api/tutor/${id}`);
      console.log('✅ tutorApi.getTutorById - Respuesta:', response.data);
      console.log('✅ Foto de perfil del tutor:', response.data.usuario?.fotoPerfil);
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.getTutorById - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  deactivateTutorById: async (id) => {
    const response = await axiosInstance.delete(`/api/tutor/${id}`);
    return response.data;
  },

  deleteMyTutorProfile: async () => {
    console.log('🗑️ tutorApi.deleteMyTutorProfile - Eliminando perfil de tutor...');
    try {
      const response = await axiosInstance.delete('/api/tutor');
      console.log('✅ tutorApi.deleteMyTutorProfile - Perfil eliminado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.deleteMyTutorProfile - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteTutorById: async (idTutor) => {
    console.log('🗑️ tutorApi.deleteTutorById - ID Tutor:', idTutor);
    try {
      const response = await axiosInstance.delete(`/api/tutor/${idTutor}`);
      console.log('✅ tutorApi.deleteTutorById - Tutor desactivado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.deleteTutorById - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  listAllTutors: async () => {
    console.log('📡 tutorApi.listAllTutors - Obteniendo todos los tutores...');
    try {
      const response = await axiosInstance.get('/api/tutor/list');
      console.log('✅ tutorApi.listAllTutors - Total:', response.data.length);
      if (response.data.length > 0) {
        console.log('✅ Primer tutor con foto:', response.data[0].usuario?.fotoPerfil);
      }
      return response.data;
    } catch (error) {
      console.error('❌ tutorApi.listAllTutors - Error:', error.response?.data || error.message);
      throw error;
    }
  },
};
